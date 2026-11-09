"use client"

import { useState } from "react"
import Link from "next/link"
import { MainTabs } from "@/components/main-tabs"
import { ThemeToggle } from "@/components/theme-toggle"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { useSessionTracking } from "@/hooks/use-session-tracking"
import { Info } from "lucide-react"

export default function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const sessionId = useSessionTracking()

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800" />
      <div
        className="absolute inset-0 bg-cover bg-center opacity-60 dark:opacity-40"
        style={{ backgroundImage: "url(/tube-feed-supplies-500.jpg)" }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "@id": "https://tubefeedrate.com/#app",
          name: "Tube Feed Tracker",
          url: "https://tubefeedrate.com/",
          description: "Calculate tube feeding rate, volume, or duration. Explore enteral formulas and keep a feeding log.",
          applicationCategory: "HealthApplication",
          operatingSystem: "Web browser",
          inLanguage: "en",
          author: { "@type": "Person", name: "Roxana Rodriguez-Becker" },
          featureList: ["Tube feed rate calculator", "Enteral formula search", "Feeding log"],
        }).replace(/</g, "\\u003c") }}
      />
      <main className="w-full max-w-4xl relative z-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="p-6">
            <div className="flex justify-end items-center mb-6">
              <div className="flex items-center gap-1">
                <Link
                  href="https://tubefeedtracker-about.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  title="Learn more about this application"
                >
                  <Info className="h-5 w-5" />
                  <span className="text-sm font-medium hidden sm:inline">About</span>
                </Link>
                <ThemeToggle isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
                
                {/* <Link
                  href="https://tubefeed-message-board-main-d0vrgs.laravel.cloud/messages"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  title="Click for app updates"
                >
                  <Info className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline"> 
                Message Board</span>
                </Link> */}
              </div>
            </div>

            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tube Feed Tracker: Tube Feed Rate Calculator</h1>
              <p className="mt-3 text-gray-600 dark:text-gray-300">
                Calculate tube feeding volume, duration, or rate in mL/hour. Explore enteral formulas
                and keep a feeding log in one place.
              </p>
            </div>

            <MainTabs sessionId={sessionId} />

            <section aria-labelledby="calculator-help" className="mt-8 space-y-4 text-gray-700 dark:text-gray-300">
              <h2 id="calculator-help" className="text-xl font-semibold text-gray-900 dark:text-white">
                Using the tube feed calculator
              </h2>
              <p>
                Tube Feed Tracker was created by Roxana Rodriguez-Becker to help families and caregivers
                work with tube feeding calculations. Use the volume, duration, and rate from your care
                team’s feeding plan. The calculator handles the arithmetic; it does not determine an
                appropriate feeding prescription.
              </p>
              <h3 className="font-semibold">How is tube feeding rate calculated?</h3>
              <p>
                Rate in mL/hour = total volume in mL ÷ feeding time in hours. Enter any two values in
                the calculator to find the third. To find volume, multiply rate by time. To find time,
                divide volume by rate.
              </p>
              <h3 className="font-semibold">What else can I do with Tube Feed Tracker?</h3>
              <p>
                The Formulas tab lets you explore enteral formula information. The Log tab helps you
                record calculations. These tools support organization and discussion with your care team.
              </p>
              <h3 className="font-semibold">Does this tool replace advice from my care team?</h3>
              <p>
                No. Follow your clinician or dietitian’s instructions for formula, volume, rate, and
                schedule. Confirm results with your care team before changing a feeding plan, including
                when using the weight-based calculator.
              </p>
            </section>

            <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Copyright 2026, Roxana Rodriguez-Becker</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                <a
                  href="https://tubefeedtracker-about.vercel.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  About
                </a>{" "}
                this Web App
              </p>
            </div>
          </div>
        </div>
      </main>

      <PWAInstallPrompt />
    </div>
  )
}
