"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { getAllSubscribers } from "@/lib/actions/newsletter-actions"
import { Loader2, Mail, Users, Send } from "lucide-react"

export default function NewsletterAdminPage() {
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [isHtml, setIsHtml] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [subscribers, setSubscribers] = useState([])
  const [subscribersLoading, setSubscribersLoading] = useState(true)

  const { toast } = useToast()

  useEffect(() => {
    async function fetchSubscribers() {
      try {
        const data = await getAllSubscribers()
        setSubscribers(data)
      } catch (error) {
        console.error("Error fetching subscribers:", error)
        toast({
          title: "Error",
          description: "Failed to load subscribers",
          variant: "destructive",
        })
      } finally {
        setSubscribersLoading(false)
      }
    }

    fetchSubscribers()
  }, [toast])

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!subject || !content) {
      toast({
        title: "Error",
        description: "Please fill in both subject and content",
        variant: "destructive",
      })
      return
    }

    if (subscribers.length === 0) {
      toast({
        title: "Error",
        description: "No subscribers found to send newsletter to",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ subject, content, isHtml }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success!",
          description: result.message,
        })
        setSubject("")
        setContent("")
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending newsletter:", error)
      toast({
        title: "Error",
        description: "Failed to send newsletter. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Newsletter Management</h1>
        <p className="text-muted-foreground mt-2">Send newsletters to your subscribers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Send Newsletter
              </CardTitle>
              <CardDescription>Compose and send a newsletter to all subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNewsletter} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Newsletter subject"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Newsletter content"
                    rows={12}
                    disabled={isSubmitting}
                  />
                  <p className="text-sm text-muted-foreground">
                    {isHtml ? "HTML content is supported" : "Plain text content"}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isHtml"
                    checked={isHtml}
                    onCheckedChange={(checked) => setIsHtml(checked as boolean)}
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="isHtml">Send as HTML</Label>
                </div>

                <Button type="submit" disabled={isSubmitting || subscribers.length === 0} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Newsletter...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Send to {subscribers.length} subscribers
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Subscribers
              </CardTitle>
              <CardDescription>Active newsletter subscribers</CardDescription>
            </CardHeader>
            <CardContent>
              {subscribersLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{subscribers.length}</div>
                    <p className="text-sm text-muted-foreground">Total active subscribers</p>
                  </div>

                  {subscribers.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm">Recent subscribers:</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {subscribers.slice(0, 10).map((subscriber: any) => (
                          <div key={subscriber._id} className="text-sm text-muted-foreground p-2 bg-muted rounded">
                            {subscriber.email}
                          </div>
                        ))}
                      </div>
                      {subscribers.length > 10 && (
                        <p className="text-xs text-muted-foreground text-center">
                          and {subscribers.length - 10} more subscribers...
                        </p>
                      )}
                    </div>
                  )}

                  {subscribers.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">No subscribers yet</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
