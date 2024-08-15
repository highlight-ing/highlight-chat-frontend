"use client";

import { useEffect, useCallback } from "react";
import Highlight, { type HighlightContext } from "@highlight-ai/app-runtime";
import { usePathname, useRouter } from "next/navigation";
import { debounce } from "throttle-debounce";
import { useSubmitQuery } from "@/hooks/useSubmitQuery";
import { useStore } from "@/providers/store-provider";
import Modals from "./modals/Modals";
import { ModalContainer } from "@/components/modals/ModalContainer";
import { useShallow } from "zustand/react/shallow";



function useContextReceivedHandler(navigateToNewChat: () => void) {
  const { addAttachment, setHighlightContext, setInput, promptApp, startNewConversation } = useStore(
    useShallow(
      (state) => ({
        addAttachment: state.addAttachment,
        setHighlightContext: state.setHighlightContext,
        setInput: state.setInput,
        promptApp: state.promptApp,
        startNewConversation: state.startNewConversation
      })
    )
  );

  const { handleIncomingContext } = useSubmitQuery();

  useEffect(() => {
    const debouncedHandleSubmit = debounce(
      300,
      async (context: HighlightContext) => {
        setInput(context.suggestion || "");
        await handleIncomingContext(context, navigateToNewChat, promptApp);
      }
    );

    const contextDestroyer = Highlight.app.addListener(
      "onContext",
      (context: HighlightContext) => {
        startNewConversation()
        setHighlightContext(context);
        debouncedHandleSubmit(context);
      }
    );

    const attachmentDestroyer = Highlight.app.addListener(
      "onConversationAttachment",
      (attachment: string) => {
        console.log(
          "[useContextReceivedHandler] Received conversation attachment:",
          attachment
        );

        addAttachment({
          type: "audio",
          value: attachment,
          duration: 0,
        });

        console.log(
          "[useContextReceivedHandler] Added attachment:",
          attachment
        );
      }
    );

    return () => {
      contextDestroyer();
      attachmentDestroyer();
    };
  }, [promptApp]);
}

/**
 * Hook that automatically registers the about me data when the app mounts.
 */
function useAboutMeRegister() {
  const setAboutMe = useStore((state) => state.setAboutMe);

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
  const pathname = usePathname();
  const router = useRouter();

  const navigateToNewChat = useCallback(() => {
    if (pathname !== "/") {
      router.push("/");
    }
  }, [pathname, router]);

  useEffect(() => {
    if (typeof window !== "undefined" && !Highlight.isRunningInHighlight()) {
      window.location.href = "https://highlight.ing/apps/highlightchat";
    }
  }, []);

  useContextReceivedHandler(navigateToNewChat);
  useAboutMeRegister();

  return (
    <>
      {children}
      <ModalContainer />
      <Modals />
    </>
  );
}
