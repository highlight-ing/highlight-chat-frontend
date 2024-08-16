import { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

export const PROMPTS_TABLE_SELECT_FIELDS =
  'external_id, name, description, prompt_text, created_at, slug, user_id, image, user_images(file_extension)'

/**
 * Admin Supabase client, this client is privileged,
 * be careful when using it.
 */
export const supabaseAdmin = createClient<Database>(
  // The Highlight Chat Supabase project URL
  'https://ykwkqpmethjmpimvftix.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)
