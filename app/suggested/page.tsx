"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import PostCard from "@/components/post-card"
import { getCurrentUser } from "@/lib/actions/auth-actions"
import { getPosts } from "@/lib/actions/post-actions"
import { getPopularPosts } from "@/lib/actions/tracking-actions"
import { Sparkles, TrendingUp } from "lucide-react"

type Post = {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: string
  coverImage: string
  publishedAt: string
}

export default function SuggestedPage() {
  const [suggestedPosts, setSuggestedPosts] = useState<Post[]>([])
  const [popularPosts, setPopularPosts] = useState<Post[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSuggestedPosts() {
      try {
        const userData = await getCurrentUser()
        setUser(userData)

        let suggested: Post[] = []

        if (userData && userData.preferences?.categories?.length > 0) {
          // Get posts from user's preferred categories
          const categoryPromises = userData.preferences.categories.map((category: string) => getPosts(3, 1, category))

          const categoryResults = await Promise.all(categoryPromises)
          const categoryPosts = categoryResults.flatMap((result) => result.posts)

          // Remove duplicates and shuffle
          const uniquePosts = categoryPosts.filter(
            (post, index, self) => index === self.findIndex((p) => p._id === post._id),
          )

          suggested = uniquePosts.sort(() => Math.random() - 0.5).slice(0, 6)
        }

        // If no user preferences or not enough posts, get recent posts
        if (suggested.length < 6) {
          const { posts: recentPosts } = await getPosts(6, 1)
          const additionalPosts = recentPosts.filter((post) => !suggested.some((s) => s._id === post._id))
          suggested = [...suggested, ...additionalPosts].slice(0, 6)
        }

        setSuggestedPosts(suggested)

        // Get popular posts
        const popularData = await getPopularPosts()
        const popularPostPromises = popularData.slice(0, 3).map(async (item: any) => {
          const pathParts = item._id.split("/")
          if (pathParts.length >= 3) {
            const category = pathParts[1]
            const slug = pathParts[2]
            const { posts } = await getPosts(1000, 1, category)
            return posts.find((post: Post) => post.slug === slug)
          }
          return null
        })

        const popularPostsData = await Promise.all(popularPostPromises)
        setPopularPosts(popularPostsData.filter(Boolean))
      } catch (error) {
        console.error("Error fetching suggested posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSuggestedPosts()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="text-center">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8" />
            Suggested for You
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {user
              ? `Personalized recommendations based on your reading preferences`
              : `Discover interesting posts curated just for you`}
          </p>
        </div>

        {/* Suggested Posts */}
        {suggestedPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              {user ? "Based on Your Interests" : "Recommended Posts"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Posts */}
        {popularPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-6 w-6" />
              Trending Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularPosts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Empty State */}
        {suggestedPosts.length === 0 && popularPosts.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Suggestions Yet</h2>
            <p className="text-muted-foreground mb-6">Start reading posts to get personalized recommendations!</p>
            <a href="/" className="text-primary hover:underline">
              Explore all posts →
            </a>
          </div>
        )}

        {/* User Info */}
        {user && (
          <div className="bg-muted/50 rounded-lg p-6 text-center">
            <h3 className="font-semibold mb-2">Your Reading Preferences</h3>
            <p className="text-sm text-muted-foreground">
              {user.preferences?.categories?.length > 0
                ? `Interested in: ${user.preferences.categories.join(", ")}`
                : "Keep reading to build your preferences!"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
