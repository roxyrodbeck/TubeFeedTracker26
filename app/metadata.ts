import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Tube Feed Tracker",
  description: "Enterprise-grade tracker for tube feed rates",
  keywords: ["tube feeding", "tube feed", "tube feed rate", "tubie", "enteral nutrition", "medical calculator", "healthcare", "nutrition tracking"],
  authors: [{ name: "Roxana Rodriguez-Becker" }],
  creator: "Roxana Rodriguez-Becker",
  publisher: "RodBeck Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tubefeedtracker.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tube Feed Tracker",
    description: "Enterprise-grade tracker for tube feed rates",
    url: "https://tubefeedtracker.app",
    siteName: "Tube Feed Tracker",
    images: [
      {
        url: "/apple-touch-icon.png",
        width: 512,
        height: 512,
        alt: "Tube Feed Tracker - Medical feeding bag icon",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tube Feed Tracker",
    description: "Enterprise-grade tracker for tube feed rates",
    images: ["/apple-touch-icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.png",
        color: "#3b82f6",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tube Feed Tracker",
  },
  generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#1f2937" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
}