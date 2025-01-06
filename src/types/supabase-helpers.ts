/**
 * Re-export types from Supabase with more proper names to improve developer experience.
 */

import { Database } from './supabase'

export type Prompt = Database['public']['Tables']['prompts']['Row'] & {
  user_images: Pick<Database['public']['Tables']['user_images']['Row'], 'file_extension'> | null
}

// src/types/supabase-helpers.ts
export type PromptWithTags = {
  id: number
  slug: string
  public_use_number: number
  created_at: string
  prompt_text: string
  public: boolean
  user_id: string
  user_images: { file_extension: string } | null
  added_prompt_tags:
    | {
        id: number
        tags: { tag: string; slug: string } | null
      }[]
    | null
  name: string
  description: string
  preferred_attachment: string | null
  can_trend: boolean | null
  create_notion_page_integration_enabled: boolean | null
  email_integration_enabled: boolean | null
  external_id: string | null
  is_handlebar_prompt: boolean
  linear_integration_enabled: boolean | null
  image: string | null
  video_url: string | null
  prompt_url: string | null
  system_prompt: string
  suggestion_prompt_text: string | null
}

export type AppShortcutPreferences = {
  id: number
  created_at: string
  user_id: string
  prompt_id: number
  application_name_darwin: string | null
  application_name_win32: string | null
  context_types: {
    screenshot: boolean
    selected_text: boolean
    clipboard_text: boolean
    audio_transcription: boolean
    window: boolean
  }
}
