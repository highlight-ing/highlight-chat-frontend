"use client";

import { fetchPrompt } from "@/app/(app)/prompts/actions";
import { useStore } from "@/providers/store-provider";
import { useRouter } from "next/navigation";

interface PromptBoxProps {
  slug: string;
  name: string;
  description: string;
}

export default function PromptBox({ slug, name, description }: PromptBoxProps) {
  const router = useRouter();

  const { setPrompt, clearPrompt } = useStore((state) => ({
    setPrompt: state.setPrompt,
    clearPrompt: state.clearPrompt,
  }));

  async function onClick() {
    if (name === "Highlight Chat") {
      clearPrompt();
      router.push("/");
      return;
    }

    // Fetch the prompt
    const prompt = await fetchPrompt(slug);

    setPrompt({
      promptName: name,
      promptDescription: description,
      promptAppName: slug,
      prompt,
    });

    router.push(`/`);
  }

  return (
    <div
      onClick={onClick}
      className="bg-light-10 p-4 rounded-lg hover:bg-light-20 cursor-pointer"
    >
      <h3>{name}</h3>
      <p className="text-sm text-light-60">{description}</p>
    </div>
  );
}
