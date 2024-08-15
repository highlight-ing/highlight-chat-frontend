'use server'

import { validateHighlightJWT } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { videoUrlSchema } from '@/lib/zod'
import { JWTPayload, JWTVerifyResult } from 'jose'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import mime from 'mime-types'

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
  name: z.string(),
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
    return { error: 'Invalid prompt data.' }
  }

  const promptData = {
    name: validated.data.name,
    description: validated.data.description,
    prompt_text: validated.data.appPrompt,
    suggestion_prompt_text: validated.data.suggestionsPrompt,
    public: validated.data.visibility === 'public',
    video_url: validated.data.videoUrl,
    user_id: userId,
    image: newImageId,
  }

  const supabase = supabaseAdmin()

  if (validated.data.externalId) {
    // Update an existing prompt

    const { error } = await supabase.from('prompts').update(promptData).eq('external_id', validated.data.externalId)

    if (error) {
      return { error: 'Error updating prompt in our database.' }
    }

    return
  } else {
    // Create a new prompt
    const { data: prompt, error } = await supabase
      .from('prompts')
      .insert(promptData)
      .select('external_id')
      .maybeSingle()

    if (error || !prompt) {
      return { error: 'Error creating prompt in our database.' }
    }

    return { newId: prompt.external_id }
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

const CreatePromptSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
  slug: z.string(),
  visibility: z.enum(['public', 'unlisted']),
})

export type CreatePromptData = z.infer<typeof CreatePromptSchema>

/**
 * Creates a new prompt in the database.
 * @deprecated Use savePrompt instead.
 */
export async function createPrompt(data: CreatePromptData, authToken: string) {
  let jwt: JWTVerifyResult<JWTPayload>

  try {
    jwt = await validateHighlightJWT(authToken)
  } catch (error) {
    return { error: 'Invalid auth token' }
  }

  // Get the user ID from the sub of the JWT
  const userId = jwt.payload.sub

  if (!userId) {
    return { error: "'sub' was missing from auth token" }
  }

  const validatedData = CreatePromptSchema.safeParse(data)

  if (!validatedData.success) {
    return { error: 'Invalid prompt data' }
  }

  const supabase = supabaseAdmin()

  const { data: prompt, error } = await supabase.from('prompts').insert({
    name: validatedData.data.name,
    description: validatedData.data.description,
    prompt_text: validatedData.data.instructions,
    user_id: userId,
    slug: validatedData.data.slug,
    public: validatedData.data.visibility === 'public',
  })

  if (error) {
    return { error: 'Error creating prompt in our database.' }
  }

  revalidatePath('/prompts')

  return { prompt: prompt }
}

const UpdatePromptSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
  visibility: z.enum(['public', 'unlisted']),
})

export type UpdatePromptData = z.infer<typeof UpdatePromptSchema>

/**
 * Updates a prompt in the database.
 * @deprecated Use savePrompt instead.
 */
export async function updatePrompt(slug: string, data: UpdatePromptData, authToken: string) {
  let jwt: JWTVerifyResult<JWTPayload>

  try {
    jwt = await validateHighlightJWT(authToken)
  } catch (error) {
    return { error: 'Invalid auth token' }
  }

  const validatedData = UpdatePromptSchema.safeParse(data)

  if (!validatedData.success) {
    return { error: 'Invalid prompt data' }
  }

  // Get the user ID from the sub of the JWT
  const userId = jwt.payload.sub

  if (!userId) {
    return { error: "'sub' was missing from auth token" }
  }

  const supabase = supabaseAdmin()

  const { data: prompt, error } = await supabase
    .from('prompts')
    .update({
      name: data.name,
      description: data.description,
      prompt_text: data.instructions,
      public: data.visibility === 'public',
    })
    .eq('slug', slug)
    .eq('user_id', userId)
    .select()
    .maybeSingle()

  if (error) {
    return { error: 'Error updating prompt in our database.' }
  }

  if (!prompt) {
    return {
      error: 'Something went wrong while updating your prompt. (nothing was returned)',
    }
  }

  revalidatePath('/prompts')

  return { prompt }
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

  const { data: prompts, error } = await supabase.from('prompts').select('*')

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

export async function deletePrompt(slug: string, authToken: string) {
  let jwt: JWTVerifyResult<JWTPayload>

  try {
    jwt = await validateHighlightJWT(authToken)
  } catch (error) {
    return { error: 'Invalid auth token' }
  }

  // Get the user ID from the sub of the JWT
  const userId = jwt.payload.sub

  if (!userId) {
    return { error: "'sub' was missing from auth token" }
  }

  const supabase = supabaseAdmin()

  const { error } = await supabase.from('prompts').delete().eq('slug', slug).eq('user_id', userId)

  if (error) {
    return { error: 'Error deleting prompt from our database.' }
  }
}
