"use client";

import { fetchPrompt } from "@/app/(app)/prompts/actions";
import { useStore } from "@/providers/store-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/catalyst/button";

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

  const onClick = async () => {
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
  };

  return (
    <a href="#" onClick={onClick}>
      <div className="bg-light-10 p-4 rounded-lg hover:bg-light-20 cursor-pointer">
        <h3>{name}</h3>
        <p className="text-sm text-light-60">{description}</p>
        <div className="mt-1 flex flex-row ">
          <Button plain>Edit</Button>
        </div>
      </div>
    </a>
  );
}
