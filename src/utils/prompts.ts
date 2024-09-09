'use server'

import { PROMPTS_TABLE_SELECT_FIELDS, supabaseAdmin } from '@/lib/supabase'
import { videoUrlSchema } from '@/lib/zod'
import { z } from 'zod'
import mime from 'mime-types'
import slugify from 'slugify'
import { nanoid } from 'nanoid'
import { PinnedPrompt } from '@/types'
import { validateUserAuth } from '@/lib/auth'

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
  externalId: z.string().optional().nullable(),
  name: z.string().max(40, { message: 'Name must be less than 40 characters' }),
  description: z.string(),
  appPrompt: z.string(),
  systemPrompt: z.string(),
  visibility: z.enum(['public', 'private']),
  videoUrl: videoUrlSchema,
  tags: z.array(z.object({ value: z.string(), label: z.string() })).optional(),
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
  })

  if (!validated.success) {
    console.warn('Invalid prompt data recieved.', validated.error)
    return { error: ERROR_MESSAGES.INVALID_PROMPT_DATA, zodErrors: validated.error }
  }

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
    tags: validated.data.tags, // Store the full tag objects
  }

  const supabase = supabaseAdmin()

  if (validated.data.externalId) {
    // Update an existing prompt

    const { data: prompt, error } = await supabase
      .from('prompts')
      .update(promptData)
      .eq('external_id', validated.data.externalId)
      .select('*, user_images(file_extension)')
      .maybeSingle()

    if (error) {
      return { error: ERROR_MESSAGES.DATABASE_ERROR }
    }

    return { prompt }
  } else {
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
  const { data: prompts, error: promptsError } = await supabase.from('prompts').select('*, user_images(file_extension)')

  if (promptsError) {
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  return { prompts: prompts, userId }
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

  return pinnedPrompts.map((p) => p.prompts) as PinnedPrompt[]
}

/**
 * Fetches a prompt from the database by slug.
 */
export async function fetchPrompt(slug: string) {
  const supabase = supabaseAdmin()

  const { data: prompt, error } = await supabase.from('prompts').select('*').eq('slug', slug).maybeSingle()

  if (error) {
    return { error: ERROR_MESSAGES.DATABASE_READ_ERROR }
  }

  return { prompt }
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

  const { data: addedPrompt } = await supabase
    .from('added_prompts')
    .select('*')
    .eq('user_id', userId)
    .eq('prompts.external_id', externalId)
    .maybeSingle()

  if (addedPrompt) {
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
