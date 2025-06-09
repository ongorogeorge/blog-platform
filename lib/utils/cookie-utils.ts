"use client"

export type CookiePreferences = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  functional: boolean
}

export const defaultCookiePreferences: CookiePreferences = {
  necessary: true, // Always true
  analytics: false,
  marketing: false,
  functional: false,
}

export const getCookiePreferences = (): CookiePreferences => {
  if (typeof window === "undefined") return defaultCookiePreferences

  try {
    const stored = localStorage.getItem("cookie-preferences")
    if (stored) {
      return { ...defaultCookiePreferences, ...JSON.parse(stored) }
    }
  } catch (error) {
    console.error("Error reading cookie preferences:", error)
  }

  return defaultCookiePreferences
}

export const setCookiePreferences = (preferences: CookiePreferences) => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("cookie-preferences", JSON.stringify(preferences))
    localStorage.setItem("cookie-consent-given", "true")
    localStorage.setItem("cookie-consent-timestamp", new Date().toISOString())

    // Trigger custom event for other components to listen to
    window.dispatchEvent(new CustomEvent("cookiePreferencesChanged", { detail: preferences }))
  } catch (error) {
    console.error("Error saving cookie preferences:", error)
  }
}

export const hasGivenConsent = (): boolean => {
  if (typeof window === "undefined") return false

  try {
    return localStorage.getItem("cookie-consent-given") === "true"
  } catch (error) {
    console.error("Error checking consent status:", error)
    return false
  }
}

export const getConsentTimestamp = (): Date | null => {
  if (typeof window === "undefined") return null

  try {
    const timestamp = localStorage.getItem("cookie-consent-timestamp")
    return timestamp ? new Date(timestamp) : null
  } catch (error) {
    console.error("Error getting consent timestamp:", error)
    return null
  }
}

export const clearCookieConsent = () => {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem("cookie-preferences")
    localStorage.removeItem("cookie-consent-given")
    localStorage.removeItem("cookie-consent-timestamp")
  } catch (error) {
    console.error("Error clearing cookie consent:", error)
  }
}

export const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
