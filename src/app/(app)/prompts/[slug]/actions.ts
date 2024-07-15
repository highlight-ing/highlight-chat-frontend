"use server";

export async function fetchPrompt(appSlug: string) {
  const appResponse = await fetch(
    `https://backend.workers.highlight.ing/v1/apps/${appSlug}`
  );

  const app = await appResponse.json();

  if (!app.is_prompt_app) {
    throw new Error("App is not a prompt app.");
  }

  const prompt = await fetch(app.entry_point_url, {
    headers: {
      "User-Agent": "Highlight Chat",
    },
  });

  const promptText = await prompt.text();

  return promptText;
}
