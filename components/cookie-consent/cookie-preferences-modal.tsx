"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  type CookiePreferences,
  getCookiePreferences,
  setCookiePreferences,
  getConsentTimestamp,
  generateSessionId,
} from "@/lib/utils/cookie-utils"
import { saveCookieConsent } from "@/lib/actions/cookie-consent-actions"
import { getCurrentUser } from "@/lib/actions/auth-actions"
import { Cookie, Shield, BarChart3, Target, Settings } from "lucide-react"

type CookiePreferencesModalProps = {
  children: React.ReactNode
}

export default function CookiePreferencesModal({ children }: CookiePreferencesModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>(getCookiePreferences())
  const [isLoading, setIsLoading] = useState(false)
  const [consentTimestamp, setConsentTimestamp] = useState<Date | null>(null)
  const [sessionId] = useState(() => generateSessionId())

  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      // Load current preferences when modal opens
      setPreferences(getCookiePreferences())
      setConsentTimestamp(getConsentTimestamp())
    }
  }, [isOpen])

  const handleSavePreferences = async () => {
    setIsLoading(true)

    try {
      // Get current user if logged in
      const user = await getCurrentUser()

      // Save to server
      const result = await saveCookieConsent(sessionId, preferences, user?._id)

      if (result.success) {
        // Save to localStorage
        setCookiePreferences(preferences)
        setIsOpen(false)

        toast({
          title: "Preferences updated",
          description: "Your cookie preferences have been saved successfully.",
        })

        // Reload page to apply new preferences
        window.location.reload()
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

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cookie className="h-5 w-5" />
            Cookie Preferences
          </DialogTitle>
          <DialogDescription>Manage your cookie preferences. Changes will take effect immediately.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {consentTimestamp && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
              <p>
                <strong>Last updated:</strong> {consentTimestamp.toLocaleDateString()}{" "}
                {consentTimestamp.toLocaleTimeString()}
              </p>
            </div>
          )}

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
                <div className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> Authentication, security, basic functionality
                </div>
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
                <div className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> Page views, time on site, bounce rate, popular content
                </div>
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
                <div className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> Social media integration, targeted advertising, conversion tracking
                </div>
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
                <div className="text-xs text-muted-foreground">
                  <strong>Examples:</strong> Language preferences, theme settings, personalized content
                </div>
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
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading} className="flex-1">
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong>Note:</strong> Disabling certain cookies may affect website functionality and your user
              experience.
            </p>
            <p>
              For more information, please read our{" "}
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
