"use server";

/**
 * Calls the Highlight backend worker, fetches the prompt, and returns the raw prompt text.
 */
export async function fetchPrompt(appSlug: string) {
  const appResponse = await fetch(
    `https://backend.workers.highlight.ing/v1/apps/${appSlug}/prompt`
  );

  if (!appResponse.ok) {
    throw new Error("Failed to fetch prompt URL from Highlight backend.");
  }

  const promptUrl = await appResponse.text();

  const prompt = await fetch(promptUrl, {
    headers: {
      "User-Agent": "Highlight Chat",
    },
  });

  const promptText = await prompt.text();

  return promptText;
}
