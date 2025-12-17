import type { Metadata } from "next";
import { playfair, inter, jetbrains } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Slate - Plan Your Perfect Evening",
  description: "Book dinner and drinks with one natural language prompt. AI-powered evening planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`
          ${playfair.variable}
          ${inter.variable}
          ${jetbrains.variable}
          font-sans antialiased
          bg-slate-black text-slate-white
        `}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-slate-red focus:text-white focus:rounded-md"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
