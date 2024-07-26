"use server";

import { validateHighlightJWT } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { JWTPayload, JWTVerifyResult } from "jose";
import { z } from "zod";

/**
 * Fetches the raw prompt text from the database.
 */
export async function fetchPromptText(slug: string) {
  const { data: prompt, error } = await supabaseAdmin
    .from("prompts")
    .select("*")
    .eq("slug", slug)
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
      "User-Agent": "Highlight Chat/0.0.1",
    },
  });

  if (!appResponse.ok) {
    throw new Error("Failed to fetch prompt from remote URL");
  }

  const promptText = await appResponse.text();

  return promptText;
}

const CreatePromptSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
  slug: z.string(),
});

export type CreatePromptData = z.infer<typeof CreatePromptSchema>;

/**
 * Creates a new prompt in the database.
 */
export async function createPrompt(data: CreatePromptData, authToken: string) {
  let jwt: JWTVerifyResult<JWTPayload>;

  try {
    jwt = await validateHighlightJWT(authToken);
  } catch (error) {
    return { error: "Invalid auth token" };
  }

  // Get the user ID from the sub of the JWT
  const userId = jwt.payload.sub;

  if (!userId) {
    return { error: "'sub' was missing from auth token" };
  }

  const validatedData = CreatePromptSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid prompt data" };
  }

  const { data: prompt, error } = await supabaseAdmin.from("prompts").insert({
    name: validatedData.data.name,
    description: validatedData.data.description,
    prompt_text: validatedData.data.instructions,
    user_id: userId,
    slug: validatedData.data.slug,
  });

  if (error) {
    return { error: "Error creating prompt in our database." };
  }

  return { prompt: prompt };
}

const UpdatePromptSchema = z.object({
  name: z.string(),
  description: z.string(),
  instructions: z.string(),
});

export type UpdatePromptData = z.infer<typeof UpdatePromptSchema>;

/**
 * Updates a prompt in the database.
 */
export async function updatePrompt(
  slug: string,
  data: UpdatePromptData,
  authToken: string
) {
  let jwt: JWTVerifyResult<JWTPayload>;

  try {
    jwt = await validateHighlightJWT(authToken);
  } catch (error) {
    return { error: "Invalid auth token" };
  }

  const validatedData = UpdatePromptSchema.safeParse(data);

  if (!validatedData.success) {
    return { error: "Invalid prompt data" };
  }

  // Get the user ID from the sub of the JWT
  const userId = jwt.payload.sub;

  if (!userId) {
    return { error: "'sub' was missing from auth token" };
  }

  const { error } = await supabaseAdmin
    .from("prompts")
    .update({
      name: data.name,
      description: data.description,
      prompt_text: data.instructions,
    })
    .eq("slug", slug)
    .eq("user_id", userId);

  if (error) {
    return { error: "Error updating prompt in our database." };
  }
}

/**
 * Fetches all prompts from the database and returns them along with the user ID.
 */
export async function fetchPrompts(authToken: string) {
  let jwt: JWTVerifyResult<JWTPayload>;

  try {
    jwt = await validateHighlightJWT(authToken);
  } catch (error) {
    return { error: "Invalid auth token" };
  }

  // Get the user ID from the sub of the JWT
  const userId = jwt.payload.sub;

  if (!userId) {
    return { error: "'sub' was missing from auth token" };
  }

  const { data: prompts, error } = await supabaseAdmin
    .from("prompts")
    .select("*");

  if (error) {
    return { error: "Error fetching prompts from Supabase" };
  }

  return { prompts, userId };
}

/**
 * Fetches a prompt from the database by slug.
 */
export async function fetchPrompt(slug: string) {
  const { data: prompt, error } = await supabaseAdmin
    .from("prompts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    return { error: "Error fetching prompt from Supabase" };
  }

  return { prompt };
}

export async function deletePrompt(slug: string, authToken: string) {
  let jwt: JWTVerifyResult<JWTPayload>;

  try {
    jwt = await validateHighlightJWT(authToken);
  } catch (error) {
    return { error: "Invalid auth token" };
  }

  // Get the user ID from the sub of the JWT
  const userId = jwt.payload.sub;

  if (!userId) {
    return { error: "'sub' was missing from auth token" };
  }

  const { error } = await supabaseAdmin
    .from("prompts")
    .delete()
    .eq("slug", slug)
    .eq("user_id", userId);

  if (error) {
    return { error: "Error deleting prompt from our database." };
  }
}
