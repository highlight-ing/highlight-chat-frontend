"use client";

import { useEffect } from "react";
import Highlight, { type HighlightContext } from "@highlight-ai/app-runtime";

import { debounce } from "throttle-debounce";
import { useSubmitQuery } from "@/hooks/useSubmitQuery";
import { useStore } from "@/providers/store-provider";
import Modals from "./modals/Modals";

/**
 * When the Highlight runtime sends us context, handle it by setting the input to the suggestion the user picked
 * and then calling the handleIncomingContext function.
 */
function useContextRecievedHandler() {
  const { addAttachment, setHighlightContext } = useStore((state) => ({
    addAttachment: state.addAttachment,
    setHighlightContext: state.setHighlightContext,
  }));

  const { setInput, prompt } = useStore((state) => ({
    setInput: state.setInput,
    prompt: state.prompt,
  }));

  const { handleIncomingContext } = useSubmitQuery();

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
      (attachment: string) => {
        // Handle the attachment here
        console.log("Received conversation attachment:", attachment);

        addAttachment({
          type: "audio",
          value: attachment,
        });

        console.log("Added attachment:", attachment);
      }
    );

    return () => {
      contextDestroyer();
      attachmentDestroyer();
    };
  }, []);
}

/**
 * Hook that automatically registers the about me data when the app mounts.
 */
function useAboutMeRegister() {
  const { setAboutMe } = useStore((state) => ({
    setAboutMe: state.setAboutMe,
  }));

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
}

/**
 * The main app component.
 *
 * This should hold all the providers.
 */
export default function App({ children }: { children: React.ReactNode }) {
  useContextRecievedHandler();
  useAboutMeRegister();

  return (
    <>
      {children}
      <Modals />
    </>
  );
}
