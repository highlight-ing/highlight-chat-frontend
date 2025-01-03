import { authenticateApiUser } from '@/lib/api'
import { DEFAULT_PROMPT_IDS, DEFAULT_PROMPT_PREFERENCES } from '@/lib/default-prompts'
import { PROMPTS_TABLE_SELECT_FIELDS, promptSelectMapper, supabaseAdmin } from '@/lib/supabase'

async function checkIfDefaultPromptsAdded(userId: string) {
  console.log('Checking default prompts for user:', userId)
  const supabase = supabaseAdmin()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .throwOnError()
    .maybeSingle()

  let hasAddedDefaultPrompts = profile?.added_default_prompts ?? false
  console.log('Has added default prompts:', hasAddedDefaultPrompts)

  if (hasAddedDefaultPrompts) {
    console.log('User already has default prompts')
    return
  }

  console.log('Adding default prompts for user')

  // Update the user's profile

  const { error: updateError } = await supabase.from('profiles').upsert(
    {
      user_id: userId,
      added_default_prompts: true,
    },
    {
      onConflict: 'user_id',
    },
  )

  if (updateError) {
    console.error('Error updating user profile:', updateError)
  }

  // Pin the 4 default prompts to the user
  const { error: insertError } = await supabase
    .from('added_prompts')
    .insert(DEFAULT_PROMPT_IDS.map((id) => ({ user_id: userId, prompt_id: id })))

  if (insertError) {
    console.error('Error pinning default prompts:', insertError)
  } else {
    console.log('Successfully added default prompts')
  }

  for (const promptId of DEFAULT_PROMPT_IDS) {
    const preferences = DEFAULT_PROMPT_PREFERENCES[promptId as keyof typeof DEFAULT_PROMPT_PREFERENCES]

    if (!preferences) {
      console.error(`Missing default preferences for prompt ${promptId}`)
      continue
    }

    const { error: prefError } = await supabase.from('app_shortcut_preferences').upsert(
      {
        prompt_id: promptId,
        user_id: userId,
        ...preferences,
      },
      {
        onConflict: 'prompt_id,user_id',
      },
    )

    if (prefError) {
      console.error(`Error setting shortcut preferences for prompt ${promptId}:`, prefError)
    }
  }

  return
}

/**
 * API route that returns all prompts for the calling user (based on the authorization token)
 *
 * This route is called by Highlight's Electron client.
 */
export async function GET(request: Request) {
  console.log('GET /api/v1/user/prompts called')

  const supabase = supabaseAdmin()

  const authUser = await authenticateApiUser(request)

  if (authUser instanceof Response) {
    return authUser
  }

  const userId = authUser.sub

  if (!userId) {
    return Response.json({ error: 'Unauthorized, no subject in token' }, { status: 401 })
  }

  // Check if the user has added the default prompts
  // await checkIfDefaultPromptsAdded(userId)

  // Select all prompts that the user has added
  const { data: selectResult, error } = await supabase
    .from('added_prompts')
    .select(`prompts(${PROMPTS_TABLE_SELECT_FIELDS}), created_at`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }

  const { data: shortcutPreferences, error: shortcutPreferencesError } = await supabase
    .from('app_shortcut_preferences')
    .select('*')
    .eq('user_id', userId)

  // Select all prompts that the user owns
  const { data: ownedPrompts, error: ownedPromptsError } = await supabase
    .from('prompts')
    .select(`${PROMPTS_TABLE_SELECT_FIELDS}`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (ownedPromptsError) {
    return Response.json({ error: ownedPromptsError.message }, { status: 500 })
  }

  // Join the two arrays
  const sortingArray = [...selectResult, ...ownedPrompts]

  // Sort by date created
  sortingArray.sort((a, b) => {
    return b.created_at.localeCompare(a.created_at)
  })

  // Ensure that the outputted array is only prompts, no extra fields
  const addedPrompts = sortingArray.map((prompt) => {
    // Check if the prompt has the correct shape
    if ('prompts' in prompt && prompt.prompts) {
      return promptSelectMapper(prompt.prompts)
    } else if ('external_id' in prompt) {
      return promptSelectMapper(prompt)
    } else {
      console.error('Unexpected prompt structure:', prompt)
      return null
    }
  })

  // Remove any nulls from the array
  let filteredPrompts = addedPrompts.filter((prompt) => prompt !== null)

  // Sort out any duplicates
  filteredPrompts = filteredPrompts.filter((prompt, index, self) => {
    return index === self.findIndex((t) => t.external_id === prompt.external_id)
  })

  const filteredPromptsWithUsages = filteredPrompts.map((prompt) => {
    let darwinAppNames: string[] = []
    let win32AppNames: string[] = []
    // default context types to false
    let contextTypes = {
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: false,
      window: false,
    }

    shortcutPreferences
      ?.filter((pref) => pref.prompt_id === prompt.id)
      .forEach((pref) => {
        if (pref.application_name_darwin) {
          if (pref.application_name_darwin === '*') {
            darwinAppNames = ['*']
          } else {
            darwinAppNames = JSON.parse(pref.application_name_darwin || '[]') as string[]
          }
        }

        if (pref.application_name_win32) {
          if (pref.application_name_win32 === '*') {
            win32AppNames = ['*']
          } else {
            win32AppNames = JSON.parse(pref.application_name_win32 || '[]') as string[]
          }
        }

        if (pref.context_types) {
          // @ts-ignore
          contextTypes = pref.context_types
        }
      })

    return {
      ...prompt,
      last_usage: null,
      scope: {
        application_name_darwin: darwinAppNames,
        application_name_win32: win32AppNames,
        context_types: contextTypes,
      },
    }
  })

  return Response.json(filteredPromptsWithUsages, { status: 200 })
}
