"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import HighlightChat from "../../../../components/HighlightChat/main";
import { usePromptContext } from "../../../../context/PromptContext";

export default function PromptsPage() {
  const { slug } = useParams<{ slug: string }>();

  const promptContext = usePromptContext();

  useEffect(() => {
    promptContext.setPrompt(slug);
  }, [name]);

  return <HighlightChat />;
}
