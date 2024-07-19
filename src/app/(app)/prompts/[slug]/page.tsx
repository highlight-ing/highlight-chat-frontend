"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import HighlightChat from "@/components/HighlightChat/HighlightChat";
import { usePromptContext } from "@/context/PromptContext";
import { fetchPrompt } from "./actions";

/**
 * This page is for "prompt apps", apps that are simply prompts and do not need their own interface.
 * They use Highlight Chat's interface instead.
 */
export default function PromptsPage() {
  // STATE
  const [loaded, setLoaded] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // HOOKS
  const { slug } = useParams<{ slug: string }>();
  const promptContext = usePromptContext();

  useEffect(() => {
    const fetch = async () => {
      const prompt = await fetchPrompt(slug);
      promptContext.setPrompt(prompt);
      setLoaded(true);
    };
    fetch();
  }, [slug]);

  // Hook that adds a window message listener
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      // TODO (IMPORTANT): add a check for event.origin, (it's null right now), but for prod, we should
      // validate that the origin is the frontend URL
    };

    window.addEventListener("message", listener);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  useEffect(() => {
    iframeRef.current?.contentWindow?.postMessage(
      {
        Hello: "this is a message",
      },
      "*" // This is * bc otherwise, we'd have to enable allow-same-origin, which would be much worse
    );
  }, [iframeLoaded]);

  if (!loaded) {
    return <div></div>;
  }

  return (
    <>
      {/* This iframe is used to load any JS the prompt app provides in a sandboxed environment */}
      {/* <iframe
        id="sandbox-frame"
        sandbox="allow-scripts"
        className="hidden"
        src={`/prompts/${slug}/iframe`}
        ref={iframeRef}
        onLoad={() => setIframeLoaded(true)}
      ></iframe> */}
      <HighlightChat />
    </>
  );
}
