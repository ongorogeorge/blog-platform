import { type NextRequest, NextResponse } from "next/server"
import { subscribeToNewsletter } from "@/lib/actions/newsletter-actions"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    const result = await subscribeToNewsletter(email)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in newsletter subscription:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}
