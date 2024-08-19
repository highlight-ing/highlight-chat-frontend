/**
 * Re-export types from Supabase with more proper names to improve developer experience.
 */

import { Database } from './supabase'

export type Prompt = Database['public']['Tables']['prompts']['Row']
