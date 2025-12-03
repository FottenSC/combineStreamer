import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SoulCalibur 6 Stream Finder | Live SC6 Streams on Twitch & YouTube",
  description: "Find all live SoulCalibur 6 streams in one place. Watch SC6, SoulCalibur VI, and Soul Calibur 6 gameplay on Twitch and YouTube. Updated in real-time.",
  keywords: ["SoulCalibur 6", "SC6", "SoulCalibur VI", "Soul Calibur 6", "live streams", "Twitch", "YouTube", "fighting game", "FGC", "streams", "gameplay"],
  authors: [{ name: "Zoetrope Stream Finder" }],
  openGraph: {
    title: "SoulCalibur 6 Stream Finder",
    description: "Find all live SoulCalibur 6 streams across Twitch and YouTube in one place.",
    type: "website",
    locale: "en_US",
    siteName: "SC6 Stream Finder",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoulCalibur 6 Stream Finder",
    description: "Find all live SoulCalibur 6 streams across Twitch and YouTube in one place.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

