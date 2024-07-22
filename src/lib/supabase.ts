import { createClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client, this client is privileged,
 * be careful when using it.
 */
export const supabaseAdmin = createClient(
  "https://ykwkqpmethjmpimvftix.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
