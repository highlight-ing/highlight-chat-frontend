import { authenticateApiUser } from '@/lib/api'
import { PROMPTS_TABLE_SELECT_FIELDS, promptSelectMapper, supabaseAdmin } from '@/lib/supabase'

const DEFAULT_PROMPT_IDS = [
  87585, 87570, 87677, 87680, 87601, 87679, 87602, 87603, 87683, 87684, 87586, 87685, 87605, 87606,
]

const DEFAULT_PROMPT_PREFERENCES = {
  // Complete Text
  87585: {
    application_name_darwin: '["Safari","Google Chrome","Discord","Notion","Slack"]',
    application_name_win32: '["Safari","Google Chrome","Discord","Notion","Slack"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Complete Code
  87602: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: true,
      audio_transcription: false,
    },
  },
  // Draft Response
  87605: {
    application_name_darwin: '*',
    application_name_win32: '*',
    context_types: {
      window: false,
      screenshot: true,
      selected_text: true,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Refactor Code
  87601: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: true,
      screenshot: false,
      selected_text: true,
      clipboard_text: true,
      audio_transcription: false,
    },
  },
  // Fix Code
  87603: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: true,
      audio_transcription: false,
    },
  },
  // Code Review
  87677: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: true,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Explain Code
  87679: {
    application_name_darwin: '["Cursor","VS Code"]',
    application_name_win32: '["Cursor","VS Code"]',
    context_types: {
      window: true,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Draft Reply
  87680: {
    application_name_darwin: '["Slack"]',
    application_name_win32: '["Slack"]',
    context_types: {
      window: true,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Quick Recap
  87683: {
    application_name_darwin: '*',
    application_name_win32: '*',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: true,
    },
  },
  // Rewrite
  87570: {
    application_name_darwin: '["Slack","Safari","Google Chrome","Notion","Discord"]',
    application_name_win32: '["Slack","Safari","Google Chrome","Notion","Discord"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: true,
      audio_transcription: false,
    },
  },
  // Follow Up
  87684: {
    application_name_darwin: '*',
    application_name_win32: '*',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: true,
    },
  },
  // Meeting Summary
  87685: {
    application_name_darwin: '*',
    application_name_win32: '*',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: false,
      clipboard_text: false,
      audio_transcription: true,
    },
  },
  // Improve Text
  87586: {
    application_name_darwin: '["Slack","Google Chrome"]',
    application_name_win32: '["Slack","Google Chrome"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
  // Proof Read
  87606: {
    application_name_darwin: '["Safari"]',
    application_name_win32: '["Safari"]',
    context_types: {
      window: false,
      screenshot: false,
      selected_text: true,
      clipboard_text: false,
      audio_transcription: false,
    },
  },
} as const

async function checkIfDefaultPromptsAdded(userId: string) {
  const supabase = supabaseAdmin()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .throwOnError()
    .maybeSingle()

  let hasAddedDefaultPrompts = profile?.added_default_prompts ?? false

  if (hasAddedDefaultPrompts) {
    return
  }

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
  }

  for (const promptId of DEFAULT_PROMPT_IDS) {
    const preferences = DEFAULT_PROMPT_PREFERENCES[promptId as keyof typeof DEFAULT_PROMPT_PREFERENCES]

    if (!preferences) {
      console.error(`Missing default preferences for prompt ${promptId}`)
      continue
    }

    const { error: prefError } = await supabase.from('app_shortcut_preferences').insert({
      prompt_id: promptId,
      user_id: userId,
      ...preferences,
    })

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
  await checkIfDefaultPromptsAdded(userId)

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
