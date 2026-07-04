import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IELTS AI Tutor",
  description: "AI-powered IELTS learning with voice conversation for all 4 skills",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
