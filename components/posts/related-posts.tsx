"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPosts } from "@/lib/actions/post-actions"
import { formatDate } from "@/lib/utils/format-date"
import { Skeleton } from "@/components/ui/skeleton"

type Post = {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: string
  coverImage: string
  publishedAt: string
}

type RelatedPostsProps = {
  currentPostId: string
  category: string
}

export default function RelatedPosts({ currentPostId, category }: RelatedPostsProps) {
  const [relatedPosts, setRelatedPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchRelatedPosts() {
      try {
        // Get posts from the same category
        const { posts } = await getPosts(6, 1, category)

        // Filter out the current post and limit to 3
        const filtered = posts.filter((post: Post) => post._id !== currentPostId).slice(0, 3)

        setRelatedPosts(filtered)
      } catch (error) {
        console.error("Error fetching related posts:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRelatedPosts()
  }, [currentPostId, category])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold">Related Posts</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
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
    )
  }

  if (relatedPosts.length === 0) {
    return null
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold">Related Posts</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {relatedPosts.map((post) => (
          <Card key={post._id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <Link href={`/${post.category}/${post.slug}`}>
              <div className="relative w-full h-48">
                <Image
                  src={post.coverImage || "/placeholder.svg?height=200&width=300"}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Link>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">
                  <Link href={`/${post.category}`} className="hover:underline">
                    {post.category}
                  </Link>
                </Badge>
                <span className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</span>
              </div>
              <Link href={`/${post.category}/${post.slug}`}>
                <h4 className="font-bold text-lg mb-2 hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h4>
              </Link>
              <p className="text-muted-foreground text-sm line-clamp-2">{post.excerpt}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
