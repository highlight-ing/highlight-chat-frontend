"use client";

import { useEffect, useCallback } from "react";
import Highlight, { type HighlightContext } from "@highlight-ai/app-runtime";
import { usePathname, useRouter } from "next/navigation";
import { debounce } from "throttle-debounce";
import { useSubmitQuery } from "@/hooks/useSubmitQuery";
import { useStore } from "@/providers/store-provider";
import Modals from "./modals/Modals";
import { ModalContainer } from "@/components/modals/ModalContainer";
import {useShallow} from "zustand/react/shallow";
import { initAmplitude, trackEvent } from "@/utils/amplitude";
import useAuth from '@/hooks/useAuth';
import { decodeJwt } from 'jose';

function useContextReceivedHandler(navigateToNewChat: () => void) {
  const { addAttachment, setHighlightContext, setInput, promptApp } = useStore(
    useShallow((state) => ({
      addAttachment: state.addAttachment,
      setHighlightContext: state.setHighlightContext,
      setInput: state.setInput,
      promptApp: state.promptApp,
    }))
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
  const { getAccessToken } = useAuth();

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

  useEffect(() => {
    const initializeAmplitude = async () => {
      try {
        // Get the access token using the useAuth hook
        const accessToken = await getAccessToken();
        
        // Decode the token to get the payload
        const payload = decodeJwt(accessToken);
        
        // Extract the user ID from the 'sub' field
        const userId = payload.sub as string;
        
        if (!userId) {
          throw new Error('User ID not found in token');
        }
        
        // Initialize Amplitude with the user ID
        initAmplitude(userId);
        
        // Track the app initialization event
        trackEvent('HL Chat App Initialized', { userId });
      } catch (error) {
        console.error('Failed to initialize Amplitude:', error);
        
        // Fallback to a random ID if token retrieval or decoding fails
        const fallbackId = `anonymous_${Math.random().toString(36).substr(2, 9)}`;
        initAmplitude(fallbackId);
        trackEvent('HL Chat App Initialized', { fallbackId, error: 'Failed to get userId' });
      }
    };

    initializeAmplitude();
  }, [getAccessToken]);

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