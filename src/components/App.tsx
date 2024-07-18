"use client";

import { useEffect } from "react";
import Highlight, { type HighlightContext } from "@highlight-ai/app-runtime";
import { useHighlightContextContext } from "@/context/HighlightContext";
import { debounce } from "throttle-debounce";
import { useSubmitQuery } from "@/hooks/useSubmitQuery";
import { usePromptContext } from "@/context/PromptContext";
import { useStore } from "@/providers/store-provider";

/**
 * When the Highlight runtime sends us context, handle it by setting the input to the suggestion the user picked
 * and then calling the handleIncomingContext function.
 */
function useContextRecievedHandler() {
  const { setHighlightContext } = useHighlightContextContext();

  const { setInput } = useStore((state) => ({
    setInput: state.setInput,
  }));

  const { handleIncomingContext } = useSubmitQuery();
  const { prompt } = usePromptContext();

  const debouncedHandleSubmit = debounce(
    300,
    async (context: HighlightContext) => {
      setInput(context.suggestion || "");
      await handleIncomingContext(context, prompt);
    }
  );

  useEffect(() => {
    const destroyer = Highlight.app.addListener(
      "onContext",
      (context: HighlightContext) => {
        setHighlightContext(context);

        debouncedHandleSubmit(context);
      }
    );

    return () => {
      destroyer();
    };
  }, []);
}

/**
 * The main app component.
 *
 * This should hold all the providers and context providers.
 */
export default function App({ children }: { children: React.ReactNode }) {
  useContextRecievedHandler();

  return <>{children}</>;
}
