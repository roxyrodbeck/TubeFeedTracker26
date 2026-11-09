import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "Tube Feed Rate Calculator | Tube Feed Tracker",
  description: "Calculate tube feeding rate, volume, or duration. Explore enteral formulas and keep a feeding log with Tube Feed Tracker.",
  keywords: ["tube feeding", "tube feed", "tube feed rate", "tubie", "enteral nutrition", "medical calculator", "healthcare", "nutrition tracking"],
  authors: [{ name: "Roxana Rodriguez-Becker" }],
  creator: "Roxana Rodriguez-Becker",
  publisher: "RodBeck Digital",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tubefeedrate.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Tube Feed Rate Calculator | Tube Feed Tracker",
    description: "Calculate tube feeding rate, volume, or duration. Explore enteral formulas and keep a feeding log with Tube Feed Tracker.",
    url: "https://tubefeedrate.com",
    siteName: "Tube Feed Tracker",
    images: [
      {
        url: "/apple-touch-icon.png",
        width: 180,
        height: 180,
        alt: "Tube Feed Tracker - Medical feeding bag icon",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tube Feed Rate Calculator | Tube Feed Tracker",
    description: "Calculate tube feeding rate, volume, or duration. Explore enteral formulas and keep a feeding log with Tube Feed Tracker.",
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