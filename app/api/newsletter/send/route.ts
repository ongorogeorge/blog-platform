import { type NextRequest, NextResponse } from "next/server"
import { getAllSubscribers } from "@/lib/actions/newsletter-actions"

export async function POST(request: NextRequest) {
  try {
    const { subject, content, isHtml } = await request.json()

    if (!subject || !content) {
      return NextResponse.json({ success: false, message: "Subject and content are required" }, { status: 400 })
    }

    // Get all active subscribers
    const subscribers = await getAllSubscribers()

    if (subscribers.length === 0) {
      return NextResponse.json({ success: false, message: "No active subscribers found." }, { status: 400 })
    }

    // Prepare email content with unsubscribe links
    const emails = subscribers.map((subscriber: any) => subscriber.email)
    const unsubscribeFooter = isHtml
      ? `<br><br><hr><p style="font-size: 12px; color: #666;">
           You can <a href="${process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ongoro.top"}/unsubscribe?token={{UNSUBSCRIBE_TOKEN}}">unsubscribe</a> from this newsletter at any time.
         </p>`
      : `\n\n---\nUnsubscribe from this newsletter: ${process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ongoro.top"}/unsubscribe?token={{UNSUBSCRIBE_TOKEN}}`

    // Send emails individually to include personalized unsubscribe links
    const results = []
    for (const subscriber of subscribers) {
      const personalizedContent = isHtml
        ? content + unsubscribeFooter.replace("{{UNSUBSCRIBE_TOKEN}}", subscriber.unsubscribeToken)
        : content + unsubscribeFooter.replace("{{UNSUBSCRIBE_TOKEN}}", subscriber.unsubscribeToken)

      const emailData = {
        to: subscriber.email,
        subject,
        ...(isHtml ? { html: personalizedContent } : { text: personalizedContent }),
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ongoro.top"}/api/email/send`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
          },
        )

        const result = await response.json()
        results.push({ email: subscriber.email, success: result.success })
      } catch (error) {
        console.error(`Error sending email to ${subscriber.email}:`, error)
        results.push({ email: subscriber.email, success: false })
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Newsletter sent successfully to ${successCount} subscribers${failureCount > 0 ? ` (${failureCount} failed)` : ""}.`,
      summary: {
        total: subscribers.length,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error("Error sending newsletter:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
