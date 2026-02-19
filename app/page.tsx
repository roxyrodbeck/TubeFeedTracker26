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
      <div className="w-full max-w-4xl relative z-10">
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
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tube Feed Tracker</h1>
            </div>

            <MainTabs sessionId={sessionId} />

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
      </div>

      <PWAInstallPrompt />
    </div>
  )
}
