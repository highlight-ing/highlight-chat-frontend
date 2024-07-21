"use client";

import React from "react";
import { StoreProvider } from "@/providers/store-provider";
import { HighlightContextContextProvider } from "@/context/HighlightContext";
import { PromptContextProvider } from "@/context/PromptContext";
import App from "@/components/App";

import "./globals.css";
import { AboutMeContextProvider } from "@/context/AboutMeContext";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <AboutMeContextProvider>
        <StoreProvider>
          <HighlightContextContextProvider>
            <PromptContextProvider>
              <App>{children}</App>
            </PromptContextProvider>
          </HighlightContextContextProvider>
        </StoreProvider>
      </AboutMeContextProvider>
    </div>
  );
}
