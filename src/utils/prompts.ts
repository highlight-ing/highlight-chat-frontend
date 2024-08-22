'use server'

import { validateHighlightJWT } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { videoUrlSchema } from '@/lib/zod'
import { JWTPayload, JWTVerifyResult } from 'jose'
import { z } from 'zod'
import mime from 'mime-types'
import slugify from 'slugify'

async function validateUserAuth(authToken: string) {
  let jwt: JWTVerifyResult<JWTPayload>

  try {
    jwt = await validateHighlightJWT(authToken)
  } catch (error) {
    throw new Error('Invalid auth token')
  }

  const userId = jwt.payload.sub

  if (!userId) {
    throw new Error('User ID not found in auth token')
  }

  return userId
}

const SavePromptSchema = z.object({
  externalId: z.string().optional().nullable(),
  name: z.string().max(40, { message: 'Name must be less than 40 characters' }),
  description: z.string(),
  appPrompt: z.string(),
  suggestionsPrompt: z.string(),
  visibility: z.enum(['public', 'private']),
  videoUrl: videoUrlSchema,
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
 * Finds the next available slug for a prompt.
 * This is to help prevent collisions with slugs.
 * Note: a race condition exists where in two users try using the same slug at the same time.
 */
async function findNextAvailableSlug(slug: string) {
  slug = slugify(slug)

  const supabase = supabaseAdmin()

  const { data: lastPrompt, error } = await supabase
    .from('prompts')
    .select('*')
    .like('slug', `${slug}%`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('Error fetching last avaliable prompt from Supabase', error)
    throw new Error('Error fetching last avaliable prompt from Supabase')
  }

  if (!lastPrompt) {
    // There are no other prompts with this slug
    return slug
  }

  const lastPromptSlug = lastPrompt.slug ?? ''

  const lastPromptSplit = lastPromptSlug.split('-')
  const lastPromptNumberSection = lastPromptSplit[lastPromptSplit.length - 1]

  if (!lastPromptNumberSection) {
    throw new Error('Last prompt slug is not in the correct format')
  }

  // Validate that the last prompt number section is a number
  const lastPromptNumber = parseInt(lastPromptNumberSection)

  if (isNaN(lastPromptNumber)) {
    // There exists only one other prompt without a number
    return `${slug}-2`
  }

  const nextNumber = lastPromptNumber + 1

  return `${lastPromptSplit.slice(0, -1).join('-')}-${nextNumber}`
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
    return { error: 'Invalid auth token' }
  }

  // Check if an image needs to be uploaded
  const photoFile = formData.get('uploadingImage') as File | null

  let newImageId: string | null = null

  if (photoFile) {
    try {
      newImageId = await uploadImage(photoFile, userId)
    } catch (error) {
      console.warn('Error uploading image', error)
      return { error: 'Error uploading image' }
    }
  }

  console.log('video url', formData.get('videoUrl'))

  const validated = SavePromptSchema.safeParse({
    externalId: formData.get('externalId'),
    name: formData.get('name'),
    description: formData.get('description'),
    appPrompt: formData.get('appPrompt'),
    suggestionsPrompt: formData.get('suggestionsPrompt'),
    visibility: formData.get('visibility'),
    videoUrl: formData.get('videoUrl'),
  })

  if (!validated.success) {
    console.warn('Invalid prompt data recieved.', validated.error)
    return { error: 'Invalid prompt data.', zodErrors: validated.error }
  }

  const promptData = {
    name: validated.data.name,
    description: validated.data.description,
    prompt_text: validated.data.appPrompt,
    suggestion_prompt_text: validated.data.suggestionsPrompt,
    public: validated.data.visibility === 'public',
    video_url: validated.data.videoUrl,
    user_id: userId,
    image: newImageId ?? undefined,
    is_handlebar_prompt: true,
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
      return { error: 'Error updating prompt in our database.' }
    }

    return { prompt }
  } else {
    // Generate the slug from the name
    const slug = await findNextAvailableSlug(validated.data.name)

    // Create a new prompt
    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert({ ...promptData, slug })
      .select('*, user_images(file_extension)')
      .maybeSingle()

    if (error || !prompt) {
      return { error: 'Error creating prompt in our database.' }
    }

    return { prompt, new: true }
  }
}

/**
 * Fetches the raw prompt text from the database.
 */
export async function fetchPromptText(externalId: string) {
  const supabase = supabaseAdmin()

  const { data: prompt, error } = await supabase.from('prompts').select('*').eq('external_id', externalId).maybeSingle()

  if (error) {
    throw new Error('Error fetching prompt from Supabase')
  }

  if (!prompt) {
    throw new Error('Prompt not found in Supabase')
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
    return { error: 'Invalid auth token' }
  }

  const supabase = supabaseAdmin()

  const { data: prompts, error } = await supabase.from('prompts').select('*, user_images(file_extension)')

  if (error) {
    return { error: 'Error fetching prompts from Supabase' }
  }

  return { prompts, userId }
}

/**
 * Fetches a prompt from the database by slug.
 */
export async function fetchPrompt(slug: string) {
  const supabase = supabaseAdmin()

  const { data: prompt, error } = await supabase.from('prompts').select('*').eq('slug', slug).maybeSingle()

  if (error) {
    return { error: 'Error fetching prompt from Supabase' }
  }

  return { prompt }
}

export async function deletePrompt(externalId: string, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: 'Invalid auth token' }
  }

  const supabase = supabaseAdmin()

  const { error } = await supabase.from('prompts').delete().eq('external_id', externalId).eq('user_id', userId)

  if (error) {
    return { error: 'Error deleting prompt from our database.' }
  }
}

export async function addPromptToUser(externalId: string, authToken: string) {
  let userId: string
  try {
    userId = await validateUserAuth(authToken)
  } catch (error) {
    return { error: 'Invalid auth token' }
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
    throw new Error('Prompt not found in Supabase')
  }

  // Otherwise, add the prompt to the user
  const { error: insertError } = await supabase.from('added_prompts').insert({
    user_id: userId,
    prompt_id: prompt.id,
  })

  if (insertError) {
    console.error('Error adding prompt to user', insertError)
    throw new Error('Error adding prompt to user')
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
    return { error: 'Error fetching prompt app from Supabase' }
  }

  return { promptApp }
}
