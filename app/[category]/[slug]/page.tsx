import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Suspense } from "react"
import { getPostBySlug } from "@/lib/actions/post-actions"
import { trackPageView } from "@/lib/actions/tracking-actions"
import { getCurrentUser } from "@/lib/actions/auth-actions"
import { formatDate } from "@/lib/utils/format-date"
import { Badge } from "@/components/ui/badge"
import CommentSection from "@/components/comments/comment-section"
import RelatedPosts from "@/components/posts/related-posts"
import SocialShareButtons from "@/components/posts/social-share-buttons"
import PostVoteButtons from "@/components/posts/post-vote-buttons"
import { Eye } from "lucide-react"

type PostPageProps = {
  params: {
    category: string
    slug: string
  }
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.category, params.slug)

  if (!post) {
    return {
      title: "Post Not Found",
    }
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://blog.ongoro.top"}/${params.category}/${params.slug}`

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      siteName: "George Ongoro Blog",
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      creator: "@georgeongoro",
    },
    alternates: {
      canonical: url,
    },
  }
}

async function PageViewTracker({ path, userId }: { path: string; userId?: string }) {
  await trackPageView(path, userId)
  return null
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPostBySlug(params.category, params.slug)

  if (!post) {
    notFound()
  }

  const user = await getCurrentUser()
  const currentPath = `/${params.category}/${params.slug}`
  const shareUrl = `/${params.category}/${params.slug}`

  return (
    <>
      <Suspense fallback={null}>
        <PageViewTracker path={currentPath} userId={user?._id} />
      </Suspense>

      <article className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">
              <Link href={`/${post.category}`}>{post.category}</Link>
            </Badge>
            <span className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Post view tracked</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-6">{post.title}</h1>

          <p className="text-xl text-muted-foreground mb-8">{post.excerpt}</p>

          {/* Social Share and Vote Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <SocialShareButtons url={shareUrl} title={post.title} excerpt={post.excerpt} />

            <PostVoteButtons postId={post._id} />
          </div>
        </div>

        <div className="relative w-full h-[400px] mb-8">
          <Image
            src={post.coverImage || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
            priority
          />
        </div>

        <div className="prose dark:prose-invert max-w-none mb-12" dangerouslySetInnerHTML={{ __html: post.content }} />

        {/* Related Posts */}
        <div className="border-t pt-12 mb-12">
          <RelatedPosts currentPostId={post._id} category={post.category} />
        </div>

        {/* Comments Section */}
        <div className="border-t pt-12">
          <CommentSection postId={post._id} />
        </div>
      </article>
    </>
  )
}
