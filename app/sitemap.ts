import type { MetadataRoute } from "next"
import connectDB from "@/lib/db"
import Post from "@/lib/models/post"
import Category from "@/lib/models/category"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ongoro.top"

  // Base routes
  const routes = ["", "/about", "/contact"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }))

  try {
    await connectDB()

    // Get all posts
    const posts = await Post.find({ published: true }).lean()

    // Get all categories
    const categories = await Category.find().lean()

    // Category routes
    const categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))

    // Post routes
    const postRoutes = posts.map((post) => ({
      url: `${baseUrl}/${post.category}/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }))

    return [...routes, ...categoryRoutes, ...postRoutes]
  } catch (error) {
    console.error("Error generating sitemap:", error)
    // Return basic routes if database connection fails
    return routes
  }
}
