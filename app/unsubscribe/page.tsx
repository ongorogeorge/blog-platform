"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { unsubscribeFromNewsletter } from "@/lib/actions/newsletter-actions"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function UnsubscribePage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    async function handleUnsubscribe() {
      if (!token) {
        setStatus("error")
        setMessage("Invalid unsubscribe link.")
        return
      }

      try {
        const result = await unsubscribeFromNewsletter(token)

        if (result.success) {
          setStatus("success")
          setMessage(result.message)
        } else {
          setStatus("error")
          setMessage(result.message)
        }
      } catch (error) {
        setStatus("error")
        setMessage("An error occurred. Please try again.")
      }
    }

    handleUnsubscribe()
  }, [token])

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {status === "loading" && <Loader2 className="h-5 w-5 animate-spin" />}
            {status === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === "error" && <XCircle className="h-5 w-5 text-red-500" />}
            Newsletter Unsubscribe
          </CardTitle>
          <CardDescription>
            {status === "loading" && "Processing your unsubscribe request..."}
            {status === "success" && "You have been successfully unsubscribed"}
            {status === "error" && "There was an issue with your request"}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">{message}</p>
          <Button asChild>
            <a href="/">Return to Blog</a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
