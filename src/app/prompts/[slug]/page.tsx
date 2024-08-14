import Button from "@/components/Button/Button";
import NotFoundPage from "@/components/NotFoundPage/NotFoundPage";
import PromptListingPage from "@/components/prompts/PromptListingPage/PromptListingPage";
import PromptShareButton from "@/components/prompts/PromptListingPage/PromptShareButton";
import { RelatedAppProps } from "@/components/prompts/PromptListingPage/RelatedApp";
import { supabaseAdmin } from "@/lib/supabase";
import { Metadata, ResolvingMetadata } from "next";

interface PromptPageProps {
  params: { slug: string };
}

async function getPrompt(slug: string) {
  return await supabaseAdmin
    .from("prompts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
}

export async function generateMetadata(
  { params }: PromptPageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data: prompt, error } = await getPrompt(params.slug);

  if (error) {
    throw error;
  }

  if (!prompt) {
    return {
      title: "Page Not Found",
      description: "The page you are looking for does not exist.",
    };
  }

  return {
    title: `${prompt.name} | Highlight Prompts`,
    description: prompt.description ?? "",
  };
}

export default async function PromptPage({ params }: PromptPageProps) {
  // Look up the prompt by slug

  const { data: prompt, error } = await getPrompt(params.slug);

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
    <div className="bg-bg-layer-1 min-h-screen">
      <div className="flex flex-row justify-between p-4 border-b border-b-light-5">
        <div></div>
        <h3>Highlight Apps</h3>
        <div>
          <PromptShareButton />
        </div>
      </div>
      <div className="p-20">
        <PromptListingPage
          name={prompt.name}
          author={"Unknown"}
          description={prompt.description ?? ""}
          relatedApps={relatedApps}
        />
      </div>
    </div>
  );
}
