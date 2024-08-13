import NotFoundPage from "@/components/NotFoundPage/NotFoundPage";
import PromptListingPage from "@/components/prompts/PromptListingPage/PromptListingPage";
import { RelatedAppProps } from "@/components/prompts/PromptListingPage/RelatedApp";
import { supabaseAdmin } from "@/lib/supabase";

export default async function PromptPage({
  params,
}: {
  params: { slug: string };
}) {
  // Look up the prompt by slug
  const { data: prompt, error } = await supabaseAdmin
    .from("prompts")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error) {
    return <div>Error fetching prompt: {error.message}</div>;
  }

  if (!prompt) {
    return <NotFoundPage />;
  }

  // Fetch "related" prompts
  const { data: relatedPrompts, error: relatedPromptsError } =
    await supabaseAdmin
      .from("prompts")
      .select("*")
      .neq("id", prompt.id)
      .order("created_at", { ascending: false })
      .limit(3);

  let relatedApps: RelatedAppProps[] = [];

  if (relatedPrompts) {
    // Append related prompts
    relatedPrompts.forEach((relatedPrompt) => {
      if (!relatedPrompt.slug) {
        return;
      }

      relatedApps.push({
        name: relatedPrompt.name,
        description: relatedPrompt.description ?? "",
        slug: relatedPrompt.slug,
      });
    });
  }

  return (
    <div className="bg-bg-layer-1 min-h-screen p-20">
      <PromptListingPage
        name={prompt.name}
        author={"Unknown"}
        description={prompt.description ?? ""}
        relatedApps={relatedApps}
      />
    </div>
  );
}
