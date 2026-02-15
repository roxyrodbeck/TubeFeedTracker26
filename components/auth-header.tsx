"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export function AuthHeader() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  const displayName = user?.user_metadata?.full_name || user?.email

  return (
    <header className="w-full">
      <div className="max-w-4xl mx-auto px-4 py-4 flex justify-end gap-2">
        {loading ? null : user ? (
          <>
            <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center mr-1">
              {displayName}
            </span>
            <button
              onClick={handleSignOut}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium text-sm h-8 px-4"
            >
              Sign Out
            </button>
            <a href="https://buymeacoffee.com/xivv7akp0n" target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-200 hover:bg-green-300 text-gray-800 rounded-md font-medium text-sm h-8 px-4">Tip Jar</Button>
            </a>
          </>
        ) : (
          <>
            <Link href="/auth/signin">
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium text-sm h-8 px-4">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signin">
              <button className="bg-[#18A34A] hover:bg-[#18A34A]/60 text-white rounded-md font-medium text-sm h-8 px-4">
                Sign Up
              </button>
            </Link>
            <a href="https://buymeacoffee.com/xivv7akp0n" target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-200 hover:bg-green-300 text-gray-800 rounded-md font-medium text-sm h-8 px-4">Tip Jar</Button>
            </a>
          </>
        )}
      </div>
    </header>
  )
}
