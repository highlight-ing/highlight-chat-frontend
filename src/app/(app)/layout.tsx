"use client";

import React from "react";
import { AuthContextProvider } from "../../context/AuthContext";
import { ConversationProvider } from "../../context/ConversationContext";
import { HighlightContextContextProvider } from "../../context/HighlightContext";
import { InputContextProvider } from "../../context/InputContext";
import { MessagesContextProvider } from "../../context/MessagesContext";
import { PromptContextProvider } from "../../context/PromptContext";

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
