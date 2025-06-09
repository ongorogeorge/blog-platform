"use client"

import { useEffect } from "react"
import { getCookiePreferences, hasGivenConsent } from "@/lib/utils/cookie-utils"

export default function VercelAnalytics() {
  useEffect(() => {
    // Only initialize analytics if consent has been given and analytics cookies are enabled
    if (hasGivenConsent()) {
      const preferences = getCookiePreferences()

      if (preferences.analytics) {
        // Initialize Vercel Analytics
        import("@vercel/analytics").then(({ inject }) => {
          inject()
        })
      }
    }

    // Listen for cookie preference changes
    const handlePreferenceChange = (event: CustomEvent) => {
      const preferences = event.detail

      if (preferences.analytics) {
        // Initialize analytics if not already done
        import("@vercel/analytics").then(({ inject }) => {
          inject()
        })
      } else {
        // Disable analytics if user opts out
        if (typeof window !== "undefined" && window.va) {
          // Note: Vercel Analytics doesn't have a direct disable method
          // In a real implementation, you might need to handle this differently
          console.log("Analytics disabled by user preference")
        }
      }
    }

    window.addEventListener("cookiePreferencesChanged", handlePreferenceChange as EventListener)

    return () => {
      window.removeEventListener("cookiePreferencesChanged", handlePreferenceChange as EventListener)
    }
  }, [])

  return null
}
