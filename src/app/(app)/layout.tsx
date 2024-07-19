"use client";

import React from "react";
import { AuthContextProvider } from "../../context/AuthContext";
import { ConversationProvider } from "../../context/ConversationContext";
import { HighlightContextContextProvider } from "../../context/HighlightContext";
import { InputContextProvider } from "../../context/InputContext";
import { MessagesContextProvider } from "../../context/MessagesContext";
import { PromptContextProvider } from "../../context/PromptContext";
import { AboutMeContextProvider } from "@/context/AboutMeContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthContextProvider>
      <HighlightContextContextProvider>
        <AboutMeContextProvider>
          <ConversationProvider>
            <MessagesContextProvider>
            <InputContextProvider>
              <PromptContextProvider>{children}</PromptContextProvider>
            </InputContextProvider>
            </MessagesContextProvider>
          </ConversationProvider>
        </AboutMeContextProvider>
      </HighlightContextContextProvider>
    </AuthContextProvider>
  );
}
