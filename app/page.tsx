import { Suspense } from "react"
import { getPosts } from "@/lib/actions/post-actions"
import { trackPageView } from "@/lib/actions/tracking-actions"
import { getCurrentUser } from "@/lib/actions/auth-actions"
import PostCard from "@/components/post-card"
import CategoryExplorer from "@/components/categories/category-explorer"
import SuggestedBlogSection from "@/components/homepage/suggested-blog-section"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

function PostsSkeleton() {
  return (
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
  )
}

async function PostsList() {
  try {
    const { posts } = await getPosts(10, 1)

    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">No posts yet</h2>
          <p className="text-muted-foreground">Check back later for new content!</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <PostCard key={post._id} post={post} featured={index === 0} />
        ))}
      </div>
    )
  } catch (error) {
    console.error("Error loading posts:", error)
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4">Error loading posts</h2>
        <p className="text-muted-foreground">Please try refreshing the page.</p>
      </div>
    )
  }
}

async function PageViewTracker({ userId }: { userId?: string }) {
  await trackPageView("/", userId)
  return null
}

export default async function Home() {
  const user = await getCurrentUser()

  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker userId={user?._id} />
      </Suspense>

      <div className="container mx-auto px-4 py-8">
        <section className="mb-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Welcome to George Ongoro Blog</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sharing insights, experiences, and knowledge across various topics. Join me on this journey of learning
              and discovery.
            </p>
          </div>

          {/* Suggested Blog Section */}
          <Suspense fallback={<PostsSkeleton />}>
            <SuggestedBlogSection />
          </Suspense>

          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-6">Latest Posts</h2>
          </div>

          <Suspense fallback={<PostsSkeleton />}>
            <PostsList />
          </Suspense>
        </section>

        {/* Category Explorer Section */}
        <section className="border-t pt-16">
          <Suspense fallback={<PostsSkeleton />}>
            <CategoryExplorer />
          </Suspense>
        </section>
      </div>
    </>
  )
}
