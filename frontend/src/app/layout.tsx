import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Reviewer & Explainer",
  description: "AI-powered LeetCode-style coding workspace with code review, chat, and analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-zinc-950 text-zinc-50 antialiased h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
