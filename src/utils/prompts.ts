'use server'

import { PinnedPrompt } from '@/types'
import mime from 'mime-types'
import { nanoid } from 'nanoid'
import slugify from 'slugify'
import { z } from 'zod'

import { validateUserAuth } from '@/lib/auth'
import { PROMPTS_TABLE_SELECT_FIELDS, promptSelectMapper, supabaseAdmin } from '@/lib/supabase'
import { PreferredAttachmentSchema, videoUrlSchema } from '@/lib/zod'

/**
 * This file contains all the server actions for interacting with prompts.
 */

/**
 * Error messages for the prompts server actions.
 */
const ERROR_MESSAGES = {
  INVALID_AUTH_TOKEN: 'Invalid authorization token. Try refreshing Highlight Chat.',
  IMAGE_UPLOAD_ERROR: 'Error uploading image. Try again later.',
  INVALID_PROMPT_DATA: 'Invalid prompt data was sent.',
  DATABASE_ERROR: 'Error occurred while making a write to database.',
  DATABASE_READ_ERROR: 'Error occurred while reading from database.',
  PROMPT_NOT_FOUND: 'Prompt not found in database.',
}

const SavePromptSchema = z.object({
  externalId: z.string().nullish(),
  name: z.string().max(40, { message: 'Name must be less than 40 characters' }),
  description: z.string(),
  appPrompt: z.string(),
  systemPrompt: z.string(),
  visibility: z.enum(['public', 'private']),
  videoUrl: videoUrlSchema,
  tags: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
  preferredAttachment: PreferredAttachmentSchema.nullish(),
  enabledAutomations: z
    .object({
      createLinearIssue: z.boolean(),
      createNotionPage: z.boolean(),
    })
    .optional(),
})

export type SavePromptData = z.infer<typeof SavePromptSchema>

/**
 * Takes a File object, adds an entry in user_images, and uploads the image data to Supabase.
 */
async function uploadImage(file: File, userId: string) {
  const fileExt = mime.extension(file.type)

  if (!fileExt) {
    throw new Error('Invalid file type')
  }

  const supabase = supabaseAdmin()

  const { data: userImage } = await supabase
    .from('user_images')
    .insert({
      file_extension: fileExt,
      public: true,
      user_id: userId,
    })
    .select()
    .single()
    .throwOnError()

  if (!userImage) {
    throw new Error('Error inserting user_image entry')
  }

  const photoId = userImage.external_id

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: storageError } = await supabase.storage.from('user_content').upload(`${photoId}.${fileExt}`, buffer, {
    contentType: file.type,
  })

  if (storageError) {
    throw storageError
  }

  return photoId
}

/**
 * Updates the tags set on a prompt.
 * @param promptId The ID of the prompt to add the tags to.
 * @param tags The numerical, internal IDs of the tags to add to the prompt.
 */
async function updatePromptTags(promptId: number, tags: number[]) {
  const supabase = supabaseAdmin()

  // Select all the tags that have been added to the prompt
  const { data: existingTags } = await supabase
    .from('added_prompt_tags')
    .select('tag_id')
    .eq('prompt_id', promptId)
    .throwOnError()

  // Create an array of tags to delete
  const tagsToDelete = existingTags
    ?.map((x) => x.tag_id)
    .filter((x) => x !== null)
    .filter((x) => !tags.includes(x))

  if (tagsToDelete) {
    await supabase.from('added_prompt_tags').delete().in('tag_id', tagsToDelete).throwOnError()
  }

  // Create an array of tags to add
  const tagsToAdd = tags.filter((x) => !existingTags?.map((y) => y.tag_id).includes(x))

  await supabase
    .from('added_prompt_tags')
    .upsert(
      tagsToAdd.map((x) => ({
        tag_id: x,
        prompt_id: promptId,
      })),
    )
    .throwOnError()
}

/**
 * Creates or updates a prompt in the database.
 * @param formData The form data containing the prompt data.
 * @param authToken The authentication token from useAuth()
 * @returns The new ID of the prompt if it was created, void if it was updated, or an error if there was an issue.
 */
export async function savePrompt(formData: FormData, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN }
  }

  // Check if an image needs to be uploaded
  const photoFile = formData.get('uploadingImage') as File | null

  let newImageId: string | null = null

  if (photoFile) {
    try {
      newImageId = await uploadImage(photoFile, userId)
    } catch (error) {
      console.warn('Error uploading image', error)
      return { error: ERROR_MESSAGES.IMAGE_UPLOAD_ERROR }
    }
  }

  const validated = SavePromptSchema.safeParse({
    externalId: formData.get('externalId'),
    name: formData.get('name'),
    description: formData.get('description'),
    appPrompt: formData.get('appPrompt'),
    systemPrompt: formData.get('systemPrompt'),
    visibility: formData.get('visibility'),
    videoUrl: formData.get('videoUrl'),
    tags: JSON.parse(formData.get('tags') as string),
    preferredAttachment: formData.get('preferredAttachment'),
    enabledAutomations: JSON.parse(formData.get('enabledAutomations') as string),
  })

  if (!validated.success) {
    console.warn('Invalid prompt data recieved.', validated.error)
    return { error: ERROR_MESSAGES.INVALID_PROMPT_DATA, zodErrors: validated.error }
  }

  const supabase = supabaseAdmin()

  // Handle the tags by looping through them and slugifying them
  const tags =
    validated.data.tags?.map((tag) => {
      return {
        label: tag.label,
        // Turn them into slugs
        value: slugify(tag.value, {
          lower: true,
        }),
      }
    }) ?? []

  // Check if the tags have already been created, if so, we don't need to create new entries.
  const { data: existingTags, error: existingTagsError } = await supabase
    .from('tags')
    .select('id, slug')
    .in(
      'slug',
      tags.map((x) => x.value),
    )

  if (existingTagsError) {
    console.error('Error fetching existing tags', existingTagsError)
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  // Create the tags that don't exist
  const { data: createdTags, error: createTagsError } = await supabase
    .from('tags')
    .insert(
      tags
        .filter((x) => !existingTags.map((y) => y.slug).includes(x.value))
        .map((x) => ({
          tag: x.label,
          slug: x.value,
        })),
    )
    .select('id, slug')

  if (createTagsError) {
    console.error('Error creating tags', createTagsError)
    return { error: ERROR_MESSAGES.DATABASE_ERROR }
  }

  // Combine both the existing and created tags, so that we know which tag IDs need to be added to the prompt
  const tagsToAdd = [...existingTags, ...createdTags].map((x) => x.id)

  const promptData = {
    name: validated.data.name,
    description: validated.data.description,
    prompt_text: validated.data.appPrompt,
    system_prompt: validated.data.systemPrompt,
    public: validated.data.visibility === 'public',
    video_url: validated.data.videoUrl,
    user_id: userId,
    image: newImageId ?? undefined,
    is_handlebar_prompt: true,
    preferred_attachment: validated.data.preferredAttachment,
    linear_integration_enabled: validated.data.enabledAutomations?.createLinearIssue ?? false,
    create_notion_page_integration_enabled: validated.data.enabledAutomations?.createNotionPage ?? false,
  }

  if (validated.data.externalId) {
    // Update an existing prompt

    const { data: prompt, error } = await supabase
      .from('prompts')
      .update(promptData)
      .eq('external_id', validated.data.externalId)
      .eq('user_id', userId)
      .select('*, user_images(file_extension)')
      .maybeSingle()

    if (error || !prompt) {
      return { error: ERROR_MESSAGES.DATABASE_ERROR }
    }

    // Add the tags to the prompt
    await updatePromptTags(prompt.id, tagsToAdd)

    return { prompt }
  } else {
    // Create a new prompt

    // Generate the slug from the name
    let slug = slugify(validated.data.name, { lower: true })

    // Add a nanoid to the end of the slug to make it unique
    slug += '-' + nanoid(12)

    // Create a new prompt
    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert({ ...promptData, slug })
      .select('*, user_images(file_extension)')
      .maybeSingle()

    if (error || !prompt) {
      console.error('Error creating prompt in our database.', error)
      return { error: ERROR_MESSAGES.DATABASE_ERROR }
    }

    // Add the tags to the prompt
    await updatePromptTags(prompt.id, tagsToAdd)

    return { prompt, new: true }
  }
}

/**
 * Updates the visibility of a prompt in the database.
 */
export async function updatePromptVisibility(externalId: string, visibility: boolean, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN }
  }

  const supabase = supabaseAdmin()

  const { error } = await supabase
    .from('prompts')
    .update({ public: visibility })
    .eq('external_id', externalId)
    .eq('user_id', userId)

  if (error) {
    return { error: ERROR_MESSAGES.DATABASE_ERROR }
  }
}

/**
 * Fetches the raw prompt text from the database.
 */
export async function fetchPromptText(externalId: string) {
  const supabase = supabaseAdmin()

  const { data: prompt, error } = await supabase.from('prompts').select('*').eq('external_id', externalId).maybeSingle()

  if (error) {
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  if (!prompt) {
    return { error: 'Prompt not found in database.' }
  }

  // Check if the prompt is just regular text

  if (prompt.prompt_text) {
    return prompt.prompt_text
  }

  if (!prompt.prompt_url) {
    throw new Error('Prompt URL was blank along with the prompt text, nothing to use for this prompt.')
  }

  // Otherwise, fetch the prompt from the remote URL specified
  const appResponse = await fetch(prompt.prompt_url, {
    headers: {
      'User-Agent': 'Highlight Chat/0.0.1',
    },
  })

  if (!appResponse.ok) {
    throw new Error('Failed to fetch prompt from remote URL')
  }

  const promptText = await appResponse.text()

  return promptText
}

/**
 * Fetches all prompts from the database and returns them along with the user ID.
 */
export async function fetchPrompts(authToken: string) {
  let userId: string

  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN }
  }

  const supabase = supabaseAdmin()

  // Select all private or public prompts user has created
  const { data: prompts, error: promptsError } = await supabase
    .from('prompts')
    .select(
      'id, external_id, name, description, prompt_text, prompt_url, created_at, slug, user_id, public, suggestion_prompt_text, video_url, image, is_handlebar_prompt, public_use_number, system_prompt, can_trend, user_images(file_extension), preferred_attachment, added_prompt_tags(tags(external_id, tag, slug)), linear_integration_enabled, email_integration_enabled, create_notion_page_integration_enabled, create_gcal_event_integration_enabled, canShowOnPromptPage',
    )
    .eq('user_id', userId)

  // Map the prompts to follow the original structure with tags.
  const mappedPrompts = prompts?.map(promptSelectMapper) ?? []

  if (promptsError) {
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  // Select trending prompts
  const { data: trendingPrompts, error: trendingPromptsError } = await supabase
    .from('prompts')
    .select(
      'id, external_id, name, description, prompt_text, prompt_url, created_at, slug, user_id, public, suggestion_prompt_text, video_url, image, is_handlebar_prompt, public_use_number, system_prompt, can_trend, user_images(file_extension), preferred_attachment, added_prompt_tags(tags(external_id, tag, slug)), linear_integration_enabled, email_integration_enabled, create_notion_page_integration_enabled, create_gcal_event_integration_enabled, canShowOnPromptPage',
    )
    .eq('can_trend', true)

  const mappedTrendingPrompts = trendingPrompts?.map(promptSelectMapper) ?? []

  return {
    prompts: [...mappedPrompts, ...mappedTrendingPrompts],
  }
}

/**
 * Fetches prompts from the database that the user has pinned.
 */
export async function fetchPinnedPrompts(authToken: string): Promise<{ error: string } | PinnedPrompt[]> {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN }
  }

  const supabase = supabaseAdmin()

  // Select all prompts that the user has added
  const { data: pinnedPrompts, error: pinnedPromptsError } = await supabase
    .from('added_prompts')
    .select(`prompts(${PROMPTS_TABLE_SELECT_FIELDS})`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (pinnedPromptsError) {
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  return pinnedPrompts.map((p) => promptSelectMapper(p.prompts)) as PinnedPrompt[]
}

export async function deletePrompt(externalId: string, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN }
  }

  const supabase = supabaseAdmin()

  const { error } = await supabase.from('prompts').delete().eq('external_id', externalId).eq('user_id', userId)

  if (error) {
    return { error: ERROR_MESSAGES.DATABASE_ERROR }
  }
}

/**
 * "Pins" a prompt to the user; adds the prompt to the user's added_prompts table.
 */
export async function addPromptToUser(externalId: string, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN }
  }

  // Check if the user already has the prompt
  const supabase = supabaseAdmin()

  console.log({ userId, externalId })

  const { data: addedPrompt } = await supabase
    .from('added_prompts')
    .select(`*, prompts!inner (*)`)
    .eq('prompts.external_id', externalId)
    .eq('user_id', userId)

  if (addedPrompt && addedPrompt.length > 0) {
    // Prompt has already been added, no need to do anything
    return
  }

  const { data: prompt } = await supabase.from('prompts').select('id').eq('external_id', externalId).maybeSingle()

  if (!prompt) {
    console.error('Prompt not found in Supabase')
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  // Otherwise, add the prompt to the user
  const { error: insertError } = await supabase.from('added_prompts').insert({
    user_id: userId,
    prompt_id: prompt.id,
  })

  if (insertError) {
    console.error('Error adding prompt to user', insertError)
    return { error: ERROR_MESSAGES.DATABASE_ERROR }
  }
}

/**
 * This function should probably be renamed to unpinPromptFromUser
 */
export async function removePromptFromUser(externalId: string, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN }
  }

  const supabase = supabaseAdmin()

  // Find the prompt ID
  const { data: prompt } = await supabase.from('prompts').select('id').eq('external_id', externalId).maybeSingle()

  if (!prompt) {
    console.error('Prompt not found in Supabase')
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  // Remove the prompt from the user's added_prompts
  const { error: deleteError } = await supabase
    .from('added_prompts')
    .delete()
    .eq('user_id', userId)
    .eq('prompt_id', prompt.id)

  if (deleteError) {
    console.error('Error removing prompt from user', deleteError)
    return { error: ERROR_MESSAGES.DATABASE_ERROR }
  }
}

export async function serverGetPromptByExternalId(externalId: string) {
  const supabase = supabaseAdmin()

  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*, user_images(file_extension)')
    .eq('external_id', externalId)
    .maybeSingle()

  if (error) {
    console.error('Error fetching prompt from Supabase', error)
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  return { prompt }
}

export async function serverGetPromptAppById(id: number) {
  const supabase = supabaseAdmin()

  const { data: promptApp, error } = await supabase
    .from('prompts')
    .select('*, user_images(file_extension)')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching prompt app from Supabase', error)
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  return { promptApp }
}

export async function getPromptAppBySlug(slug: string) {
  const supabase = supabaseAdmin()

  const { data: promptApp, error } = await supabase
    .from('prompts')
    .select('*, user_images(file_extension)')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error('Error fetching prompt app from Supabase', error)
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  return { promptApp }
}

/**
 * Records that a prompt was viewed by a user.
 */
export async function countPromptView(externalId: string, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: ERROR_MESSAGES.INVALID_AUTH_TOKEN }
  }

  const supabase = supabaseAdmin()

  const { data: promptApp, error } = await supabase
    .from('prompts')
    .select('id')
    .eq('external_id', externalId)
    .maybeSingle()

  if (error) {
    console.error('countPromptView: Error fetching prompt from Supabase', error)
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  if (!promptApp) {
    console.error('Prompt app not found in Supabase')
    return { error: ERROR_MESSAGES.PROMPT_NOT_FOUND }
  }

  const { error: promptUsageError } = await supabase.from('prompt_usages').insert({
    prompt_id: promptApp.id,
    user_id: userId,
  })

  if (promptUsageError) {
    console.error('countPromptView: Error inserting prompt usage', promptUsageError)
    return { error: ERROR_MESSAGES.DATABASE_ERROR }
  }
}
