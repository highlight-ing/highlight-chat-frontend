"use client";

import React from "react";
import { StoreProvider } from "@/providers/store-provider";
import App from "@/components/App";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <StoreProvider>
        <App>{children}</App>
      </StoreProvider>
    </div>
  );
}
