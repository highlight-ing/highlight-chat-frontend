import { supabaseAdmin } from "@/lib/supabase";
import Handlebars from "handlebars";

/**
 * API route that returns a single prompt by its slug
 */
export async function GET(
  request: Request,
  { params }: { params: { external_id: string } }
) {
  const { data: prompt, error } = await supabaseAdmin
    .from("prompts")
    .select("suggestion_prompt_text")
    .eq("public", true)
    .eq("external_id", params.external_id)
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (!prompt) {
    return Response.json({ error: "Prompt not found" }, { status: 404 });
  }

  if (!prompt.suggestion_prompt_text) {
    return Response.json(
      { error: "Prompt has no suggestion prompt text." },
      { status: 404 }
    );
  }

  const translatedPrompt = Handlebars.compile(prompt.suggestion_prompt_text);

  // Transform the prompt editor format into the suggestions format

  const translated = translatedPrompt({
    image: "{{environment.ocrScreenContents}}",
    clipboard: "{{environment.clipboardText}}",
    about_me: "{{factsAboutMe}}",
    screen: "{{environment.ocrScreenContents}}",
  });

  return new Response(`{{#system}}\n${translated}\n{{/system}}`, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}
