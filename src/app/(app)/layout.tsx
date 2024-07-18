import React from "react";
import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import AppLayout from "@/components/AppLayout";

import "./globals.css";

const publicSans = Public_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Highlight Chat",
  description: "Chat with Highlight",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={publicSans.className}>
      <AppLayout>{children}</AppLayout>
    </div>
  );
}
