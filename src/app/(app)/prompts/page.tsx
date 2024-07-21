import TopBar from "@/components/Navigation/TopBar";
import PromptBox from "@/components/prompts/PromptBox";
import { useMemo } from "react";

async function fetchPrompts() {
  const appsResponse = await fetch(
    "https://backend.workers.highlight.ing/v1/apps/prompts?q=1"
  );

  const apps = await appsResponse.json();

  console.log(apps);

  return apps;
}

export default async function PromptsPage() {
  const prompts = await fetchPrompts();

  return (
    <div className="bg-light-5 h-screen">
      <TopBar />
      <div className="p-4">
        <h1 className="text-2xl">Prompts</h1>
        <p className="text-light-60">
          Create your own prompts or use already existing prompts.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <PromptBox
            slug="hlchat"
            name="Highlight Chat"
            description="The standard Highlight Chat. Oriented towards critical thinking and questioning."
          />
          {prompts.map((prompt: any) => (
            <PromptBox
              key={prompt.id}
              slug={prompt.slug}
              name={prompt.name}
              description={prompt.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
