"use server"

import connectDB from "@/lib/db"
import PageView from "@/lib/models/page-view"
import Post from "@/lib/models/post"
import PostVote from "@/lib/models/post-vote"
import Comment from "@/lib/models/comment"
import { formatISO, subDays } from "date-fns"

// Get total visits and unique visitors
export async function getVisitStats(days = 30) {
  try {
    await connectDB()

    const startDate = subDays(new Date(), days)

    const totalVisits = await PageView.countDocuments({
      createdAt: { $gte: startDate },
    })

    // Count unique visitors by IP or sessionId
    const uniqueVisitors = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $ne: ["$userId", null] },
              "$userId",
              {
                $cond: [{ $ne: ["$sessionId", null] }, "$sessionId", "$ip"],
              },
            ],
          },
        },
      },
      {
        $count: "count",
      },
    ])

    return {
      totalVisits,
      uniqueVisitors: uniqueVisitors[0]?.count || 0,
    }
  } catch (error) {
    console.error("Error getting visit stats:", error)
    return {
      totalVisits: 0,
      uniqueVisitors: 0,
    }
  }
}

// Get daily visits for the past N days
export async function getDailyVisits(days = 30) {
  try {
    await connectDB()

    const startDate = subDays(new Date(), days)

    const dailyVisits = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ])

    // Fill in missing dates with zero counts
    const result = []
    for (let i = 0; i < days; i++) {
      const date = formatISO(subDays(new Date(), days - i - 1)).split("T")[0]
      const found = dailyVisits.find((item) => item._id === date)
      result.push({
        date,
        visits: found ? found.count : 0,
      })
    }

    return result
  } catch (error) {
    console.error("Error getting daily visits:", error)
    return []
  }
}

// Get traffic sources
export async function getTrafficSources(days = 30) {
  try {
    await connectDB()

    const startDate = subDays(new Date(), days)

    const sources = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          referrer: { $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$referrer", ""] },
              then: "direct",
              else: {
                $cond: {
                  if: { $regexMatch: { input: "$referrer", regex: /google\.com/ } },
                  then: "google",
                  else: {
                    $cond: {
                      if: { $regexMatch: { input: "$referrer", regex: /facebook\.com/ } },
                      then: "facebook",
                      else: {
                        $cond: {
                          if: { $regexMatch: { input: "$referrer", regex: /twitter\.com/ } },
                          then: "twitter",
                          else: "other",
                        },
                      },
                    },
                  },
                },
              },
            },
            count: { $sum: 1 },
          },
        },
      },
    ])

    // Count direct visits (no referrer)
    const directVisits = await PageView.countDocuments({
      createdAt: { $gte: startDate },
      $or: [{ referrer: null }, { referrer: "" }],
    })

    const result = [
      { source: "direct", count: directVisits },
      ...sources.map((item) => ({
        source: item._id,
        count: item.count,
      })),
    ]

    return result
  } catch (error) {
    console.error("Error getting traffic sources:", error)
    return []
  }
}

// Get most popular posts
export async function getPopularPosts(limit = 10) {
  try {
    await connectDB()

    // Get page views per post
    const postViews = await PageView.aggregate([
      {
        $match: {
          path: { $regex: /^\/[^/]+\/[^/]+$/ }, // Match post paths
        },
      },
      {
        $group: {
          _id: "$path",
          views: { $sum: 1 },
        },
      },
      {
        $sort: { views: -1 },
      },
      {
        $limit: limit,
      },
    ])

    // Extract post details from paths
    const postsWithStats = await Promise.all(
      postViews.map(async (item) => {
        const pathParts = item._id.split("/")
        if (pathParts.length >= 3) {
          const category = pathParts[1]
          const slug = pathParts[2]

          const post = await Post.findOne({ category, slug }).lean()

          if (post) {
            // Get upvotes and downvotes
            const upvotes = await PostVote.countDocuments({
              postId: post._id,
              voteType: "upvote",
            })

            const downvotes = await PostVote.countDocuments({
              postId: post._id,
              voteType: "downvote",
            })

            // Get comments count
            const comments = await Comment.countDocuments({
              postId: post._id,
            })

            return {
              _id: post._id,
              title: post.title,
              slug: post.slug,
              category: post.category,
              views: item.views,
              upvotes,
              downvotes,
              comments,
              engagement: upvotes + downvotes + comments,
            }
          }
        }
        return null
      }),
    )

    return postsWithStats.filter(Boolean)
  } catch (error) {
    console.error("Error getting popular posts:", error)
    return []
  }
}

// Get engagement metrics
export async function getEngagementMetrics(days = 30) {
  try {
    await connectDB()

    const startDate = subDays(new Date(), days)

    // Get total votes
    const votes = await PostVote.countDocuments({
      createdAt: { $gte: startDate },
    })

    // Get total comments
    const comments = await Comment.countDocuments({
      createdAt: { $gte: startDate },
    })

    // Get average time on site (this is an approximation)
    // For a real implementation, you would need client-side tracking
    const avgTimeOnSite = 120 // placeholder: 2 minutes in seconds

    return {
      votes,
      comments,
      avgTimeOnSite,
    }
  } catch (error) {
    console.error("Error getting engagement metrics:", error)
    return {
      votes: 0,
      comments: 0,
      avgTimeOnSite: 0,
    }
  }
}

// Get device and browser stats
export async function getDeviceStats(days = 30) {
  try {
    await connectDB()

    const startDate = subDays(new Date(), days)

    // Extract device type from user agent
    const deviceStats = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          userAgent: { $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: "$userAgent", regex: /Mobile|Android|iPhone|iPad|iPod/i } },
              "mobile",
              {
                $cond: [{ $regexMatch: { input: "$userAgent", regex: /Tablet|iPad/i } }, "tablet", "desktop"],
              },
            ],
          },
          count: { $sum: 1 },
        },
      },
    ])

    // Extract browser info from user agent
    const browserStats = await PageView.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          userAgent: { $ne: null, $ne: "" },
        },
      },
      {
        $group: {
          _id: {
            $cond: [
              { $regexMatch: { input: "$userAgent", regex: /Chrome/i } },
              "Chrome",
              {
                $cond: [
                  { $regexMatch: { input: "$userAgent", regex: /Firefox/i } },
                  "Firefox",
                  {
                    $cond: [
                      { $regexMatch: { input: "$userAgent", regex: /Safari/i } },
                      "Safari",
                      {
                        $cond: [
                          { $regexMatch: { input: "$userAgent", regex: /Edge|Edg/i } },
                          "Edge",
                          {
                            $cond: [
                              { $regexMatch: { input: "$userAgent", regex: /MSIE|Trident/i } },
                              "Internet Explorer",
                              "Other",
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          count: { $sum: 1 },
        },
      },
    ])

    return {
      devices: deviceStats.map((item) => ({
        device: item._id,
        count: item.count,
      })),
      browsers: browserStats.map((item) => ({
        browser: item._id,
        count: item.count,
      })),
    }
  } catch (error) {
    console.error("Error getting device stats:", error)
    return {
      devices: [],
      browsers: [],
    }
  }
}
