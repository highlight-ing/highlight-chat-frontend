import TopBar from "@/components/Navigation/TopBar";
import { Button } from "@/components/catalyst/button";
import PromptBox from "@/components/prompts/PromptBox";
import { supabaseAdmin } from "@/lib/supabase";

async function fetchPrompts() {
  const { data: prompts, error } = await supabaseAdmin
    .from("prompts")
    .select("*");

  if (error) {
    console.error("Error fetching prompts from Supabase", error);
    return [];
  }

  console.log("prompts", prompts);

  return prompts;
}

export default async function PromptsPage() {
  const prompts = await fetchPrompts();

  return (
    <div className="h-screen bg-light-5">
      <TopBar />
      <div className="p-4">
        <h1 className="text-2xl">Prompts</h1>
        <p className="text-light-60">
          Prompts change the way Highlight Chat talks to you. Create your own or
          use already existing prompts.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <PromptBox
            slug="hlchat"
            name="Highlight Chat"
            description="The standard Highlight Chat. Oriented towards critical thinking and questioning."
          />
          {prompts.map((prompt) => (
            <PromptBox
              key={prompt.external_id}
              slug={prompt.external_id}
              name={prompt.name}
              description={prompt.description ?? ""}
            />
          ))}
        </div>

        <div className="flex flex-row justify-between items-center mt-4">
          <div>
            <h1 className="text-2xl">My Prompts</h1>
            <p className="text-light-60">
              Create your own prompts or use already existing prompts.
            </p>
          </div>
          <div>
            <Button outline href="/prompts/create">
              Create New Prompt
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <PromptBox
            slug="hlchat"
            name="Highlight Chat"
            description="The standard Highlight Chat. Oriented towards critical thinking and questioning."
          />
        </div>
      </div>
    </div>
  );
}
