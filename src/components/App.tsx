"use client";

import { useEffect } from "react";
import Highlight, { type HighlightContext } from "@highlight-ai/app-runtime";
import { useHighlightContextContext } from "@/context/HighlightContext";

import { debounce } from "throttle-debounce";
import { useSubmitQuery } from "@/hooks/useSubmitQuery";
import { usePromptContext } from "@/context/PromptContext";
import { useStore } from "@/providers/store-provider";
import { useAboutMeContext } from "@/context/AboutMeContext";

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
    const contextDestroyer = Highlight.app.addListener(
      "onContext",
      (context: HighlightContext) => {
        setHighlightContext(context);
        debouncedHandleSubmit(context);
      }
    );

    const attachmentDestroyer = Highlight.app.addListener(
      "onConversationAttachment",
      (attachment: any) => {
        // Handle the attachment here
        console.log("Received conversation attachment:", attachment);
        // You may want to add additional logic to process the attachment
      }
    );

    return () => {
      contextDestroyer();
      attachmentDestroyer();
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

  const { setAboutMe } = useAboutMeContext();

  // Move this to a new hook
  useEffect(() => {
    const getAboutMe = async () => {
      const aboutMe = await Highlight.user.getFacts();
      if (aboutMe?.length > 0) {
        const aboutMeString = aboutMe.join("\n");
        console.log("About Me:", aboutMeString);
        setAboutMe(aboutMeString);
      }
    };
    getAboutMe();
  }, []);

  return <>{children}</>;
}