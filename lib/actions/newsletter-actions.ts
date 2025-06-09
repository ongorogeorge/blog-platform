"use server"

import connectDB from "@/lib/db"
import Newsletter from "@/lib/models/newsletter"
import { randomBytes } from "crypto"

export async function subscribeToNewsletter(email: string) {
  try {
    await connectDB()

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email })

    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return { success: false, message: "Email is already subscribed to the newsletter." }
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date()
        await existingSubscriber.save()

        // Send welcome email
        await sendWelcomeEmail(email, existingSubscriber.unsubscribeToken)

        return { success: true, message: "Successfully resubscribed to the newsletter!" }
      }
    }

    // Create new subscription
    const unsubscribeToken = randomBytes(32).toString("hex")

    const newSubscriber = new Newsletter({
      email,
      unsubscribeToken,
      isActive: true,
    })

    await newSubscriber.save()

    // Send welcome email
    await sendWelcomeEmail(email, unsubscribeToken)

    return { success: true, message: "Successfully subscribed to the newsletter! Check your email for confirmation." }
  } catch (error) {
    console.error("Error subscribing to newsletter:", error)
    return { success: false, message: "Failed to subscribe. Please try again." }
  }
}

export async function unsubscribeFromNewsletter(token: string) {
  try {
    await connectDB()

    const subscriber = await Newsletter.findOne({ unsubscribeToken: token })

    if (!subscriber) {
      return { success: false, message: "Invalid unsubscribe link." }
    }

    subscriber.isActive = false
    await subscriber.save()

    return { success: true, message: "Successfully unsubscribed from the newsletter." }
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error)
    return { success: false, message: "Failed to unsubscribe. Please try again." }
  }
}

export async function getAllSubscribers() {
  try {
    await connectDB()

    const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 }).lean()

    return JSON.parse(JSON.stringify(subscribers))
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return []
  }
}

async function sendWelcomeEmail(email: string, unsubscribeToken: string) {
  try {
    const unsubscribeUrl = `https://blog.ongoro.top/unsubscribe?token=${unsubscribeToken}`

    const emailData = {
      to: email,
      subject: "Welcome to George Ongoro Blog Newsletter!",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to George Ongoro Blog</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 40px;">
              <h1 style="color: #333333; font-size: 28px; margin: 0;">Welcome to George Ongoro Blog!</h1>
              <p style="color: #666666; font-size: 16px; margin: 10px 0 0 0;">Thank you for subscribing to our newsletter</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin-bottom: 30px;">
              <h2 style="color: #333333; font-size: 24px; margin: 0 0 20px 0;">Subscription Confirmed!</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Your subscription to the George Ongoro Blog newsletter has been successfully confirmed! You'll now receive updates about new blog posts, insights on technology, personal development, and exclusive content.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://blog.ongoro.top" 
                   style="background-color: #28a745; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">
                  Visit the Blog
                </a>
              </div>
            </div>
            
            <div style="border-top: 1px solid #e9ecef; padding-top: 20px;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                <strong>What to expect:</strong>
              </p>
              <ul style="color: #666666; font-size: 14px; margin: 0; padding-left: 20px;">
                <li>Updates about new blog posts</li>
                <li>Insights on technology and personal development</li>
                <li>Exclusive content and behind-the-scenes updates</li>
                <li>Tips and resources for personal growth</li>
              </ul>
            </div>
            
            <div style="background-color: #e3f2fd; padding: 20px; border-radius: 8px; margin: 30px 0;">
              <h3 style="color: #1976d2; font-size: 18px; margin: 0 0 10px 0;">Connect with me:</h3>
              <p style="color: #555555; font-size: 14px; margin: 0;">
                Follow me on social media for more updates and discussions:<br>
                <a href="https://twitter.com/georgeongoro" style="color: #1976d2; text-decoration: none;">Twitter</a> | 
                <a href="https://linkedin.com/in/georgeongoro" style="color: #1976d2; text-decoration: none;">LinkedIn</a> | 
                <a href="https://github.com/georgeongoro" style="color: #1976d2; text-decoration: none;">GitHub</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e9ecef;">
              <p style="color: #999999; font-size: 12px; margin: 0;">
                You can <a href="${unsubscribeUrl}" style="color: #007bff;">unsubscribe</a> from this newsletter at any time.
              </p>
              <p style="color: #999999; font-size: 12px; margin: 10px 0 0 0;">
                © ${new Date().getFullYear()} George Ongoro Blog. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    }

    // Send email via API route
    const response = await fetch("https://blog.ongoro.top/api/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    })

    if (!response.ok) {
      console.error("Failed to send welcome email")
      throw new Error("Failed to send email")
    }

    const result = await response.json()
    if (!result.success) {
      console.error("Email sending failed:", result.message)
      throw new Error(result.message)
    }

    console.log("Welcome email sent successfully")
  } catch (error) {
    console.error("Error sending welcome email:", error)
    throw error
  }
}
