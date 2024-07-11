"use client";

import { AuthContextProvider } from "../context/AuthContext";
import { ConversationProvider } from "../context/ConversationContext";
import { HighlightContextContextProvider } from "../context/HighlightContext";
import { InputContextProvider } from "../context/InputContext";
import { MessagesContextProvider } from "../context/MessagesContext";
import HighlightChat from "../components/HighlightChat/main";

export default function Home() {
  return (
    <AuthContextProvider>
      <HighlightContextContextProvider>
        <ConversationProvider>
          <MessagesContextProvider>
            <InputContextProvider>
              <HighlightChat />
            </InputContextProvider>
          </MessagesContextProvider>
        </ConversationProvider>
      </HighlightContextContextProvider>
    </AuthContextProvider>
  );
}
