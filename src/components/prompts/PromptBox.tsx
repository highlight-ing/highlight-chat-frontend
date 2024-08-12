"use client";

import { fetchPromptText } from "@/utils/prompts";
import { useStore } from "@/providers/store-provider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/catalyst/button";
import clsx from "clsx";
import { useShallow } from "zustand/react/shallow";
import { trackEvent } from '@/utils/amplitude';

interface PromptBoxProps {
  slug: string;
  name: string;
  description: string;
  editable?: boolean;
}

/**
 * Component that shows a prompt box with a name, description, and when clicked, opens the prompt.
 * If the editable prop is true, the component will show a button to edit the prompt.
 */
export default function PromptBox({
  slug,
  name,
  description,
  editable = false,
}: PromptBoxProps) {
  const router = useRouter();

  const { setPrompt, clearPrompt } = useStore(
    useShallow((state) => ({
      setPrompt: state.setPrompt,
      clearPrompt: state.clearPrompt,
    }))
  );

  const onClick = async () => {
    if (name === "Highlight Chat") {
      clearPrompt();
      router.push("/");
      trackEvent('hl_chat_default_chat_selected', { promptName: name });
      return;
    }

    // Fetch the prompt
    const prompt = await fetchPromptText(slug);

    setPrompt({
      promptName: name,
      promptDescription: description,
      promptAppName: slug,
      prompt,
    });

    router.push(`/`);
    trackEvent('hl_chat_prompt_selected', { promptName: name, promptSlug: slug });
  };

  const BaseElement = ({ children }: { children: React.ReactNode }) => {
    const baseClasses = "bg-light-10 p-4 rounded-lg";

    if (editable) {
      return <div className={baseClasses}>{children}</div>;
    }

    return (
      <a
        className={clsx(baseClasses, "hover:bg-light-20 cursor-pointer")}
        href="#"
        onClick={onClick}
      >
        {children}
      </a>
    );
  };

  const onViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClick();
    trackEvent('hl_chat_prompt_viewed', { promptName: name, promptSlug: slug });
  };

  const onEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    trackEvent('hl_chat_prompt_edit_initiated', { promptName: name, promptSlug: slug });
    router.push(`/prompts/${slug}/edit`);
  };

  return (
    <BaseElement>
      <h3>{name}</h3>
      <p className="text-sm text-light-60 line-clamp-4">{description}</p>
      {editable && (
        <div className="mt-2 flex flex-row space-x-3">
          <Button plain onClick={onViewClick}>
            View
          </Button>
          <Button plain onClick={onEditClick}>
            Edit
          </Button>
        </div>
      )}
    </BaseElement>
  );
}