"use server"

import connectDB from "@/lib/db"
import PageView from "@/lib/models/page-view"
import User from "@/lib/models/user"
import { headers } from "next/headers"

export async function trackPageView(path: string, userId?: string) {
  try {
    await connectDB()

    const headersList = await headers()
    const userAgent = headersList.get("user-agent") || ""
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || ""
    const referrer = headersList.get("referer") || ""

    const pageView = new PageView({
      path,
      userId: userId || null,
      userAgent,
      ip,
      referrer,
      sessionId: `${ip}-${Date.now()}`,
    })

    await pageView.save()

    // Update user preferences if logged in
    if (userId) {
      const user = await User.findById(userId)
      if (user) {
        user.preferences.lastVisited = new Date()

        // Extract category from path if it's a post
        const pathParts = path.split("/")
        if (pathParts.length >= 3 && pathParts[1] && pathParts[2]) {
          const category = pathParts[1]
          if (!user.preferences.categories.includes(category)) {
            user.preferences.categories.push(category)
          }
        }

        await user.save()
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error tracking page view:", error)
    return { success: false }
  }
}

export async function getPageViews(path?: string, userId?: string) {
  try {
    await connectDB()

    const query: any = {}
    if (path) query.path = path
    if (userId) query.userId = userId

    const views = await PageView.find(query).sort({ createdAt: -1 }).limit(100).lean()

    return JSON.parse(JSON.stringify(views))
  } catch (error) {
    console.error("Error getting page views:", error)
    return []
  }
}

export async function getPopularPosts() {
  try {
    await connectDB()

    const popularPaths = await PageView.aggregate([
      {
        $match: {
          path: { $regex: /^\/[^/]+\/[^/]+$/ }, // Match post paths
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      },
      {
        $group: {
          _id: "$path",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
    ])

    return JSON.parse(JSON.stringify(popularPaths))
  } catch (error) {
    console.error("Error getting popular posts:", error)
    return []
  }
}
