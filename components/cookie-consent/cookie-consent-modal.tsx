"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  type CookiePreferences,
  defaultCookiePreferences,
  setCookiePreferences,
  hasGivenConsent,
  generateSessionId,
} from "@/lib/utils/cookie-utils"
import { saveCookieConsent } from "@/lib/actions/cookie-consent-actions"
import { getCurrentUser } from "@/lib/actions/auth-actions"
import { Cookie, Shield, BarChart3, Target, Settings } from "lucide-react"

export default function CookieConsentModal() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(defaultCookiePreferences)
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => generateSessionId())

  const { toast } = useToast()

  useEffect(() => {
    // Check if consent has already been given
    const consentGiven = hasGivenConsent()
    if (!consentGiven) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = async () => {
    const allAcceptedPreferences: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    }

    await savePreferences(allAcceptedPreferences)
  }

  const handleAcceptNecessary = async () => {
    await savePreferences(defaultCookiePreferences)
  }

  const handleSavePreferences = async () => {
    await savePreferences(preferences)
  }

  const savePreferences = async (prefs: CookiePreferences) => {
    setIsLoading(true)

    try {
      // Get current user if logged in
      const user = await getCurrentUser()

      // Save to server
      const result = await saveCookieConsent(sessionId, prefs, user?._id)

      if (result.success) {
        // Save to localStorage
        setCookiePreferences(prefs)
        setIsVisible(false)

        toast({
          title: "Cookie preferences saved",
          description: "Your cookie preferences have been updated successfully.",
        })

        // Initialize analytics if accepted
        if (prefs.analytics) {
          initializeAnalytics()
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to save cookie preferences. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving cookie preferences:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const initializeAnalytics = () => {
    // Initialize Vercel Analytics
    if (typeof window !== "undefined" && window.va) {
      window.va("track", "cookie_consent_analytics_accepted")
    }
  }

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Consent
          </CardTitle>
          <CardDescription>
            We use cookies to enhance your browsing experience and analyze our traffic. Please choose your preferences
            below.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showDetails ? (
            <>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This website uses cookies to ensure you get the best experience. We use necessary cookies for basic
                  functionality, and optional cookies for analytics and personalization.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleAcceptAll} disabled={isLoading} className="flex-1">
                    Accept All Cookies
                  </Button>
                  <Button variant="outline" onClick={handleAcceptNecessary} disabled={isLoading} className="flex-1">
                    Accept Necessary Only
                  </Button>
                </div>

                <Button variant="ghost" onClick={() => setShowDetails(true)} disabled={isLoading} className="w-full">
                  Customize Preferences
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        <Label className="text-base font-medium">Necessary Cookies</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Essential for the website to function properly. These cannot be disabled.
                      </p>
                    </div>
                    <Switch checked={true} disabled />
                  </div>

                  <Separator />

                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <Label className="text-base font-medium">Analytics Cookies</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Help us understand how visitors interact with our website by collecting anonymous information.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.analytics}
                      onCheckedChange={(checked) => updatePreference("analytics", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        <Label className="text-base font-medium">Marketing Cookies</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Used to track visitors across websites to display relevant advertisements.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.marketing}
                      onCheckedChange={(checked) => updatePreference("marketing", checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <Label className="text-base font-medium">Functional Cookies</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enable enhanced functionality like remembering your preferences and settings.
                      </p>
                    </div>
                    <Switch
                      checked={preferences.functional}
                      onCheckedChange={(checked) => updatePreference("functional", checked)}
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleSavePreferences} disabled={isLoading} className="flex-1">
                    {isLoading ? "Saving..." : "Save Preferences"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDetails(false)}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="text-xs text-muted-foreground">
            <p>
              By continuing to use this website, you agree to our{" "}
              <a href="/privacy-policy" className="underline hover:text-foreground">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/cookie-policy" className="underline hover:text-foreground">
                Cookie Policy
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
