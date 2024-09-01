import { Database } from '@/types/supabase'
import { createClient } from '@supabase/supabase-js'

export const PROMPTS_TABLE_SELECT_FIELDS =
  'external_id, name, description, prompt_text, created_at, slug, user_id, image, user_images(file_extension), public_use_number'

const SUPABASE_URL = 'https://ykwkqpmethjmpimvftix.supabase.co'

/**
 * Admin Supabase client, this client is privileged,
 * be careful when using it.
 */
export const supabaseAdmin = () =>
  createClient<Database>(SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    global: {
      // Prevent Next.JS from caching Supabase requests
      fetch: (url: any, options = {}) => {
        return fetch(url, { ...options, cache: 'no-store' })
      },
    },
  })

export function supabaseLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  return `${SUPABASE_URL}/storage/v1/render/image/public/${src}?width=${width}&height=${width}&quality=${quality || 75}`
}
