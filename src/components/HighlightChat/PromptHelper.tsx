"use client";

import { PromptApp } from "@/types";
import HighlightChat from "./HighlightChat";
import usePromptApps from "@/hooks/usePromptApps";
import { useEffect } from "react";

export default function PromptHelper({ prompt }: { prompt: PromptApp }) {
  const { selectPrompt } = usePromptApps();

  useEffect(() => {
    selectPrompt(prompt);
  }, [prompt]);

  return <HighlightChat />;
}
