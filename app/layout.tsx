import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motorcar Society Private Registry",
  description:
    "Private collector-car sales, matched directly to verified members.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
