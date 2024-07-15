"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HighlightChat from "../../../../components/HighlightChat/main";
import { usePromptContext } from "../../../../context/PromptContext";
import { fetchPrompt } from "./actions";

export default function PromptsPage() {
  const { slug } = useParams<{ slug: string }>();

  const [loaded, setLoaded] = useState(false);

  const promptContext = usePromptContext();

  useEffect(() => {
    const fetch = async () => {
      console.log("Fetching prompt...");
      const prompt = await fetchPrompt(slug);
      console.log("Prompt fetched:", prompt);
      promptContext.setPrompt(prompt);
      setLoaded(true);
    };
    fetch();
  }, [slug]);

  if (!loaded) {
    return <div></div>;
  }

  return <HighlightChat />;
}
