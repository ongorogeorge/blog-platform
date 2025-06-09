"use server"

import connectDB from "@/lib/db"
import CookieConsent from "@/lib/models/cookie-consent"
import { headers } from "next/headers"

export async function saveCookieConsent(
  sessionId: string,
  preferences: {
    necessary: boolean
    analytics: boolean
    marketing: boolean
    functional: boolean
  },
  userId?: string,
) {
  try {
    await connectDB()

    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || ""

    // Check if consent already exists for this session
    let consent = await CookieConsent.findOne({ sessionId })

    if (consent) {
      // Update existing consent
      consent.preferences = preferences
      consent.consentGiven = true
      consent.lastUpdated = new Date()
      if (userId) consent.userId = userId
      await consent.save()
    } else {
      // Create new consent record
      consent = new CookieConsent({
        sessionId,
        userId: userId || null,
        preferences,
        consentGiven: true,
        ipAddress: ip,
        userAgent,
      })
      await consent.save()
    }

    return { success: true, consent: JSON.parse(JSON.stringify(consent)) }
  } catch (error) {
    console.error("Error saving cookie consent:", error)
    return { success: false, message: "Failed to save cookie consent" }
  }
}

export async function getCookieConsent(sessionId: string, userId?: string) {
  try {
    await connectDB()

    let consent = null

    // Try to find by userId first if available
    if (userId) {
      consent = await CookieConsent.findOne({ userId }).sort({ lastUpdated: -1 })
    }

    // If not found by userId, try by sessionId
    if (!consent) {
      consent = await CookieConsent.findOne({ sessionId })
    }

    if (consent) {
      return { success: true, consent: JSON.parse(JSON.stringify(consent)) }
    }

    return { success: false, message: "No consent record found" }
  } catch (error) {
    console.error("Error getting cookie consent:", error)
    return { success: false, message: "Failed to get cookie consent" }
  }
}
