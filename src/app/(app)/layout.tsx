"use client";

import React from "react";
import { Public_Sans } from "next/font/google";
import { StoreProvider } from "@/providers/store-provider";
import { AuthContextProvider } from "@/context/AuthContext";
import { HighlightContextContextProvider } from "@/context/HighlightContext";
import { PromptContextProvider } from "@/context/PromptContext";
import App from "@/components/App";

import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"] });

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={publicSans.className}>
      <StoreProvider>
        <AuthContextProvider>
          <HighlightContextContextProvider>
            <PromptContextProvider>
              <App>{children}</App>
            </PromptContextProvider>
          </HighlightContextContextProvider>
        </AuthContextProvider>
      </StoreProvider>
    </div>
  );
}
