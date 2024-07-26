/**
 * Rexport types from Supabase with proper names
 */

import { Database } from "./supabase";

export type Prompt = Database["public"]["Tables"]["prompts"]["Row"];
