"use client";

import { AuthContextProvider } from "../context/AuthContext";
import { ConversationProvider } from "../context/ConversationContext";
import { HighlightContextContextProvider } from "../context/HighlightContext";
import { InputContextProvider } from "../context/InputContext";
import { MessagesContextProvider } from "../context/MessagesContext";
import { PromptContextProvider } from "../context/PromptContext";

/**
 * This component just defines the client-side layout for the Highlight Chat app.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <HighlightContextContextProvider>
        <ConversationProvider>
          <MessagesContextProvider>
            <InputContextProvider>
              <PromptContextProvider>{children}</PromptContextProvider>
            </InputContextProvider>
          </MessagesContextProvider>
        </ConversationProvider>
      </HighlightContextContextProvider>
    </AuthContextProvider>
  );
}
