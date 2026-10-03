import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Black Hawk Adventures — Himalayan road trips & treks",
    template: "%s · Black Hawk Adventures",
  },
  description:
    "Small-group road trips and mountain escapes across the Indian Himalaya. Spiti, Ladakh, Uttarakhand, Kashmir and the North East — run by local guides, with honest itineraries.",
  keywords: [
    "Himalayan treks",
    "Spiti winter trip",
    "Chadar trek",
    "Ladakh road trip",
    "Kedarkantha trek",
    "small group adventure travel India",
  ],
  authors: [{ name: "Black Hawk Adventures" }],
  openGraph: {
    type: "website",
    siteName: "Black Hawk Adventures",
    title: "Black Hawk Adventures — Himalayan road trips & treks",
    description:
      "Small-group road trips and mountain escapes across the Indian Himalaya, run by local guides.",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Black Hawk Adventures",
    description: "Small-group road trips and mountain escapes across the Indian Himalaya.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0a0f12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
