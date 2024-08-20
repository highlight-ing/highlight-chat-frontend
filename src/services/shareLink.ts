import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

//TODO: commented out to prevent hydration errors for now

// if (!supabaseUrl || !supabaseServiceRoleKey) {
//     throw new Error('Supabase URL or Service Role Key is not set');
//   }

// const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

export async function createShareLink(): Promise<string> {
  return 'https://chat-new.highlight.ing/share/TODO'
}
