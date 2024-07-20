import { Metadata } from "next";
import { Public_Sans } from "next/font/google";

export const metadata: Metadata = {
  title: "Highlight Chat",
  description: "Chat with Highlight",
};

const publicSans = Public_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-public-sans",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${publicSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
