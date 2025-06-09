"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import PostCard from "@/components/post-card"
import { getCurrentUser } from "@/lib/actions/auth-actions"
import { getPosts } from "@/lib/actions/post-actions"
import { getPopularPosts } from "@/lib/actions/tracking-actions"
import { Sparkles, TrendingUp, Clock } from "lucide-react"

type Post = {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: string
  coverImage: string
  publishedAt: string
}

export default function SuggestedBlogSection() {
  const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [suggestionType, setSuggestionType] = useState<"personalized" | "popular" | "recent">("recent")

  useEffect(() => {
    async function fetchSuggestedPosts() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)

        let suggested: Post[] = []
        let type: "personalized" | "popular" | "recent" = "recent"

        if (userData && userData.preferences?.categories?.length > 0) {
          // Get posts from user's preferred categories (personalized)
          const categoryPromises = userData.preferences.categories
            .slice(0, 3)
            .map((category: string) => getPosts(2, 1, category))

          const categoryResults = await Promise.all(categoryPromises)
          const categoryPosts = categoryResults.flatMap((result) => result.posts)

          if (categoryPosts.length > 0) {
            // Remove duplicates and shuffle
            const uniquePosts = categoryPosts.filter(
              (post, index, self) => index === self.findIndex((p) => p._id === post._id),
            )
            suggested = uniquePosts.sort(() => Math.random() - 0.5).slice(0, 4)
            type = "personalized"
          }
        }

        // If no personalized suggestions or not enough, try popular posts
        if (suggested.length < 4) {
          try {
            const popularData = await getPopularPosts()
            const popularPostPromises = popularData.slice(0, 4).map(async (item: any) => {
              const pathParts = item._id.split("/")
              if (pathParts.length >= 3) {
                const category = pathParts[1]
                const slug = pathParts[2]
                const { posts } = await getPosts(1000, 1, category)
                return posts.find((post: Post) => post.slug === slug)
              }
              return null
            })

            const popularPosts = await Promise.all(popularPostPromises)
            const validPopularPosts = popularPosts.filter(Boolean) as Post[]

            if (validPopularPosts.length > 0) {
              // Combine with existing suggestions, avoiding duplicates
              const additionalPosts = validPopularPosts.filter((post) => !suggested.some((s) => s._id === post._id))
              suggested = [...suggested, ...additionalPosts].slice(0, 4)
              type = suggested.length > 0 && type === "personalized" ? "personalized" : "popular"
            }
          } catch (error) {
            console.error("Error fetching popular posts:", error)
          }
        }

        // If still not enough posts, get recent posts
        if (suggested.length < 4) {
          const { posts: recentPosts } = await getPosts(4, 1)
          const additionalPosts = recentPosts.filter((post) => !suggested.some((s) => s._id === post._id))
          suggested = [...suggested, ...additionalPosts].slice(0, 4)
          type = suggested.length > 0 && type !== "recent" ? type : "recent"
        }

        setSuggestedPosts(suggested)
        setSuggestionType(type)
      } catch (error) {
        console.error("Error fetching suggested posts:", error)
        // Fallback to recent posts
        try {
          const { posts: recentPosts } = await getPosts(4, 1)
          setSuggestedPosts(recentPosts)
          setSuggestionType("recent")
        } catch (fallbackError) {
          console.error("Error fetching fallback posts:", fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestedPosts()
  }, [])

  const getSectionTitle = () => {
    switch (suggestionType) {
      case "personalized":
        return "Suggested for You"
      case "popular":
        return "Trending Posts"
      case "recent":
      default:
        return "Recent Posts"
    }
  }

  const getSectionIcon = () => {
    switch (suggestionType) {
      case "personalized":
        return <Sparkles className="h-6 w-6" />
      case "popular":
        return <TrendingUp className="h-6 w-6" />
      case "recent":
      default:
        return <Clock className="h-6 w-6" />
    }
  }

  const getSectionDescription = () => {
    switch (suggestionType) {
      case "personalized":
        return "Posts tailored to your reading preferences"
      case "popular":
        return "Most viewed and engaging posts"
      case "recent":
      default:
        return "Latest blog posts"
    }
  }

  if (isLoading) {
    return (
      <section className="mb-16">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-6 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    )
  }

  if (suggestedPosts.length === 0) {
    return null
  }

  return (
    <section className="mb-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
          {getSectionIcon()}
          {getSectionTitle()}
        </h2>
        <p className="text-muted-foreground">{getSectionDescription()}</p>
        {user && suggestionType === "personalized" && (
          <p className="text-sm text-muted-foreground mt-1">
            Based on your interest in: {user.preferences?.categories?.join(", ")}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {suggestedPosts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  )
}
