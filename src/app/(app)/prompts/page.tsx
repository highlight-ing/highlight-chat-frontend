"use client";

import TopBar from "@/components/Navigation/TopBar";
import PromptBox from "@/components/prompts/PromptBox";
import { useMemo } from "react";

function fetchPrompts() {
  return [
    {
      name: "Write For Me",
      description:
        "Write tailored, engaging content with a focus on quality, relevance and precise word count.",
    },
  ];
}

export default function PromptsPage() {
  const prompts = useMemo(() => fetchPrompts(), []);

  return (
    <div className="bg-light-5 h-screen">
      <TopBar showHistory={false} setShowHistory={() => {}} />
      <div className="p-4">
        <h1 className="text-2xl">Prompts</h1>
        <p className="text-light-60">
          Create your own prompts or use already existing prompts.
        </p>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <PromptBox
            name="Highlight Chat"
            description="The standard Highlight Chat. Oriented towards critical thinking and questioning."
          />
          {prompts.map((prompt) => (
            <PromptBox
              key={prompt.name}
              name={prompt.name}
              description={prompt.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
