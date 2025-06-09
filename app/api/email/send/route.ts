import { type NextRequest, NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, text } = await request.json()

    if (!to || !subject) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    console.log("Attempting to send email to:", to)
    const result = await sendEmail({ to, subject, html, text })

    if (result.success) {
      console.log("Email sent successfully:", result.messageId)
      return NextResponse.json({ success: true, messageId: result.messageId })
    } else {
      console.error("Email sending failed:", result.error)
      return NextResponse.json({ success: false, message: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Error in email send API:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
