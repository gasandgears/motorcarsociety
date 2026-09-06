import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motorcar Society Private Registry",
  description:
    "A private collector-car community dedicated to provenance, trusted relationships, and preserving the stories of remarkable motorcars.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/motorcar-society-mark.png",
    shortcut: "/motorcar-society-mark.png",
    apple: "/motorcar-society-mark.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
