"use client";

import React from "react";
import { StoreProvider } from "@/providers/store-provider";
import { HighlightContextContextProvider } from "@/context/HighlightContext";
import App from "@/components/App";

import "./globals.css";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <StoreProvider>
        <HighlightContextContextProvider>
          <App>{children}</App>
        </HighlightContextContextProvider>
      </StoreProvider>
    </div>
  );
}
