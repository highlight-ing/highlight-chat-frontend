import PromptHelper from "@/components/HighlightChat/PromptHelper";
import { supabaseAdmin } from "@/lib/supabase";

export default async function Home({
  params,
}: {
  params: { external_id: string };
}) {
  // fetch the prompt app from supabase
  const { data: prompt, error } = await supabaseAdmin
    .from("prompts")
    .select("*")
    .eq("external_id", params.external_id)
    .maybeSingle();

  if (error) {
    return <div>Error fetching prompt: {error.message}</div>;
  }

  if (!prompt) {
    return <div>Prompt not found</div>;
  }

  return <PromptHelper prompt={prompt} />;
}
