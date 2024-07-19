"use client";

import Script from "next/script";
import { useEffect } from "react";

export default function IframePage() {
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      // Validate the origin matches the frontend URL
      if (event.origin !== process.env.NEXT_PUBLIC_URL) return;

      console.log(
        "[IFrame] Message received from parent (origin verified):",
        event.data
      );

      window.top?.postMessage(
        {
          message: "This is an awesome message",
        },
        process.env.NEXT_PUBLIC_URL
      );
    };

    window.addEventListener("message", listener, false);

    return () => {
      window.removeEventListener("message", listener);
    };
  }, []);

  const onScriptLoad = () => {
    console.log("Script loaded");

    // @ts-expect-error
    onBeforePrompt();
  };

  return (
    <>
      <Script
        src="https://esm.town/v/julian7797/hl_prompt_script_test?v=2"
        onLoad={onScriptLoad}
      />
    </>
  );
}
