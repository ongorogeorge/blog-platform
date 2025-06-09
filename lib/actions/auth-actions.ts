"use server"

import connectDB from "@/lib/db"
import User from "@/lib/models/user"
import { cookies } from "next/headers"
import { randomBytes } from "crypto"

export async function loginUser(name: string, email: string) {
  try {
    await connectDB()

    let user = await User.findOne({ email })

    if (!user) {
      // Create new user
      user = new User({
        name,
        email,
        preferences: {
          categories: [],
          lastVisited: new Date(),
        },
      })
      await user.save()
    } else {
      // Update last visited
      user.preferences.lastVisited = new Date()
      await user.save()
    }

    // Create session token
    const sessionToken = randomBytes(32).toString("hex")
    const cookieStore = await cookies()

    cookieStore.set("session-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    cookieStore.set("user-id", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    })

    return {
      success: true,
      user: JSON.parse(JSON.stringify(user)),
    }
  } catch (error) {
    console.error("Error logging in user:", error)
    return {
      success: false,
      message: "Failed to login",
    }
  }
}

export async function logoutUser() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("session-token")
    cookieStore.delete("user-id")

    return { success: true }
  } catch (error) {
    console.error("Error logging out user:", error)
    return { success: false }
  }
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get("user-id")?.value

    if (!userId) {
      return null
    }

    await connectDB()
    const user = await User.findById(userId).lean()

    if (!user) {
      return null
    }

    return JSON.parse(JSON.stringify(user))
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}
