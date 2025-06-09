"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail } from "lucide-react"

export default function ConfirmSubscriptionPage() {
  const [status, setStatus] = useState<"success" | "error">("success")
  const [message, setMessage] = useState("Your subscription has been confirmed!")
  const searchParams = useSearchParams()

  // This page is now just a success page since we've simplified the subscription process
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Subscription Confirmed!
          </CardTitle>
          <CardDescription>Welcome to George Ongoro Blog newsletter</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm">{message}</p>

          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-2">
                <Mail className="h-4 w-4" />
                <span className="font-medium">What's Next?</span>
              </div>
              <ul className="text-sm text-green-600 dark:text-green-400 space-y-1 text-left">
                <li>• You'll receive email updates about new blog posts</li>
                <li>• Get insights on technology and personal development</li>
                <li>• Access to exclusive content and updates</li>
              </ul>
            </div>
            <Button asChild className="w-full">
              <a href="/">Explore the Blog</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
