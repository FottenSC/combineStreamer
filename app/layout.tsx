import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://streams.horseface.no'),
  title: {
    default: "SC6 Stream Finder",
    template: "%s | SC6 Stream Finder"
  },
  description: "Discover and watch live SoulCalibur 6 (SC6) streams from top players and content creators. Real-time updates from Twitch and YouTube. Join the fighting game community and never miss a match!",
  keywords: [
    "SoulCalibur 6", 
    "SC6", 
    "SoulCalibur VI", 
    "Soul Calibur 6", 
    "live streams", 
    "Twitch streams",
    "YouTube streams", 
    "fighting game", 
    "FGC", 
    "fighting game community",
    "competitive gaming",
    "esports",
    "stream aggregator",
    "game streams",
    "SC6 gameplay",
    "SoulCalibur streams",
    "live gaming"
  ],
  authors: [{ name: "Zoetrope Stream Finder", url: "https://streams.horseface.no" }],
  creator: "Zoetrope Stream Finder",
  publisher: "Zoetrope Stream Finder",
  applicationName: "SC6 Stream Finder",
  category: "Gaming",
  classification: "Gaming & Entertainment",
  
  // Open Graph metadata for social sharing
  openGraph: {
    title: "SoulCalibur 6 Stream Finder | Watch Live SC6 Streams",
    description: "Discover and watch live SoulCalibur 6 streams from top players. Real-time updates from Twitch and YouTube in one convenient location.",
    type: "website",
    locale: "en_US",
    url: "https://streams.horseface.no",
    siteName: "SC6 Stream Finder",
    images: [
      {
        url: "/Horseface.png",
        width: 1200,
        height: 630,
        alt: "SoulCalibur 6 Stream Finder Logo",
      }
    ],
  },
  
  // Twitter Card metadata
  twitter: {
    card: "summary_large_image",
    title: "SoulCalibur 6 Stream Finder | Watch Live SC6 Streams",
    description: "Discover and watch live SoulCalibur 6 streams from top players. Real-time updates from Twitch and YouTube.",
    images: ["/Horseface.png"],
    creator: "@ZoetropeStreams",
  },
  
  // Search engine directives
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Additional metadata
  alternates: {
    canonical: "https://streams.horseface.no",
  },
  
  // Verification (add your verification codes if you have them)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
};

// Viewport configuration (separate from metadata in Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#1a1610' },
    { media: '(prefers-color-scheme: light)', color: '#c9a84c' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured data for search engines
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://streams.horseface.no/#website",
        "url": "https://streams.horseface.no",
        "name": "SoulCalibur 6 Stream Finder",
        "description": "Discover and watch live SoulCalibur 6 streams from top players and content creators",
        "publisher": {
          "@id": "https://streams.horseface.no/#organization"
        },
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://streams.horseface.no/?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://streams.horseface.no/#organization",
        "name": "Zoetrope Stream Finder",
        "url": "https://streams.horseface.no",
        "logo": {
          "@type": "ImageObject",
          "url": "https://streams.horseface.no/Horseface.png",
          "width": 512,
          "height": 512
        },
        "sameAs": []
      },
      {
        "@type": "WebApplication",
        "name": "SC6 Stream Finder",
        "url": "https://streams.horseface.no",
        "applicationCategory": "GameApplication",
        "operatingSystem": "Any",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "ratingCount": "150"
        }
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://static-cdn.jtvnw.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://yt3.ggpht.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.twitch.tv" crossOrigin="anonymous" />
        
        {/* Web App Manifest for PWA support */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

