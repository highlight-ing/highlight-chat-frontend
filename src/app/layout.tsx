import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Highlight Chat",
  description: "Chat with Highlight",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
