"use server";

import { supabaseAdmin } from "@/lib/supabase";

/**
 * Calls the Highlight backend worker, fetches the prompt, and returns the raw prompt text.
 */
export async function fetchPrompt(externalId: string) {
  const { data: prompt, error } = await supabaseAdmin
    .from("prompts")
    .select("*")
    .eq("external_id", externalId)
    .maybeSingle();

  if (error) {
    throw new Error("Error fetching prompt from Supabase");
  }

  if (!prompt) {
    throw new Error("Prompt not found in Supabase");
  }

  // Check if the prompt is just regular text

  if (prompt.prompt_text) {
    return prompt.prompt_text;
  }

  if (!prompt.prompt_url) {
    throw new Error(
      "Prompt URL was blank along with the prompt text, nothing to use for this prompt."
    );
  }

  // Otherwise, fetch the prompt from the remote URL specified
  const appResponse = await fetch(prompt.prompt_url, {
    headers: {
      "User-Agent": "Highlight Chat/1.0",
    },
  });

  if (!appResponse.ok) {
    throw new Error("Failed to fetch prompt from remote URL");
  }

  const promptText = await appResponse.text();

  return promptText;
}
