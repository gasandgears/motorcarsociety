import type { Metadata } from "next";
import "./globals.css";

const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.collectorlegacy.com",
);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: "Motorcar Society Private Registry | Collector Cars",
    template: "%s | Motorcar Society",
  },
  description:
    "A private registry for significant collector cars—built for discreet buying, selling, provenance, and trusted collector relationships.",
  keywords: [
    "collector cars",
    "collector cars for sale",
    "buy collector cars",
    "sell collector car privately",
    "private car sale",
    "classic car registry",
    "classic car provenance",
  ],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Motorcar Society",
    title: "Motorcar Society Private Registry | Collector Cars",
    description:
      "A private registry for significant collector cars, trusted relationships, and discreet introductions.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motorcar Society Private Registry | Collector Cars",
    description:
      "A private registry for significant collector cars, trusted relationships, and discreet introductions.",
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
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Motorcar Society",
        url: siteUrl.toString(),
        description:
          "A private collector-car registry for provenance, discreet introductions, and trusted collector relationships.",
        logo: new URL("/motorcar-society-mark.png", siteUrl).toString(),
      },
      {
        "@type": "WebSite",
        name: "Motorcar Society Private Registry",
        url: siteUrl.toString(),
        inLanguage: "en-US",
      },
    ],
  };

  return (
    <html lang="en">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
