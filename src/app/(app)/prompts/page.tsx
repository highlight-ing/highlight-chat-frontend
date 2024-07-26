"use client";

import TopBar from "@/components/Navigation/TopBar";
import { Button } from "@/components/catalyst/button";
import PromptBox from "@/components/prompts/PromptBox";
import { useEffect, useState } from "react";
import { fetchPrompts } from "./actions";
import useAuth from "@/hooks/useAuth";
import { Prompt } from "@/types/supabase-helpers";
import { useStore } from "@/providers/store-provider";
import Link from "next/link";

export default function PromptsPage() {
  // STATE
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [userId, setUserId] = useState<string>();
  const [loading, setLoading] = useState(true);

  // HOOKS
  const { getTokens } = useAuth();
  const { openErrorModal } = useStore((state) => ({
    openErrorModal: state.openErrorModal,
  }));

  const myPrompts = prompts.filter((prompt) => prompt.user_id === userId);

  useEffect(() => {
    const loadPrompts = async () => {
      const { accessToken } = await getTokens();

      const response = await fetchPrompts(accessToken);

      if (response.error) {
        openErrorModal(response.error);
      }

      setUserId(response.userId);
      setPrompts(response.prompts ?? []);
      setLoading(false);
    };

    loadPrompts();
  }, []);

  return (
    <div className="h-screen bg-light-5">
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6"
      ></div>
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
          {prompts
            .filter((prompt) => prompt.user_id !== userId)
            .filter((prompt) => prompt.public)
            .map((prompt) => (
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
        {loading && (
          <div className="mt-4 text-sm">
            <p className="text-light-60">Loading...</p>
          </div>
        )}
        {myPrompts.length === 0 && !loading && (
          <div className="mt-4 text-sm">
            <p className="text-light-60">
              You don't have any prompts yet.{" "}
              <Link
                className="text-indigo-400 hover:underline hover:text-indigo-500"
                href="/prompts/create"
              >
                Create your first prompt
              </Link>{" "}
              to get started.
            </p>
          </div>
        )}
        <div className="grid grid-cols-3 gap-4 mt-4">
          {myPrompts.map((prompt) => (
            <PromptBox
              key={prompt.external_id}
              slug={prompt.slug ?? ""}
              name={prompt.name}
              description={prompt.description ?? ""}
              editable={true}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
