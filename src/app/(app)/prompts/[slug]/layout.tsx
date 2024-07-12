"use client";

import React from "react";
import { PromptContextProvider } from "../../../../context/PromptContext";

export default function PromptLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PromptContextProvider>{children}</PromptContextProvider>;
}
