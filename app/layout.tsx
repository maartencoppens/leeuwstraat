import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SITE_URL } from "@/config/site";
import { nl } from "@/content/nl";
import "./globals.css";

const newsreader = localFont({
  src: "./fonts/newsreader.woff2",
  weight: "200 800",
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: nl.meta.title,
  description: nl.meta.description,
  openGraph: {
    type: "website",
    locale: "nl_BE",
    siteName: nl.meta.siteName,
    title: nl.meta.title,
    description: nl.meta.description,
    // TODO: add an Open Graph image (1200 x 630) as app/opengraph-image.png.
  },
};

export const viewport: Viewport = {
  themeColor: "#120c07",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="nl" className={newsreader.variable}>
      <body className="flex min-h-svh flex-col bg-night-950">{children}</body>
    </html>
  );
}
