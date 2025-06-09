import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/utils/format-date"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type PostCardProps = {
  post: {
    _id: string
    title: string
    slug: string
    excerpt: string
    category: string
    coverImage: string
    publishedAt: string
  }
  featured?: boolean
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  if (!post) {
    return null
  }

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${featured ? "md:col-span-2" : ""}`}>
      <Link href={`/${post.category}/${post.slug}`} className="block">
        <div className="relative w-full h-48 md:h-64">
          <Image
            src={post.coverImage || "/placeholder.svg?height=400&width=600"}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary">
            <Link href={`/${post.category}`} className="hover:underline">
              {post.category}
            </Link>
          </Badge>
          <span className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</span>
        </div>
        <Link href={`/${post.category}/${post.slug}`} className="block">
          <h3 className={`font-bold ${featured ? "text-2xl" : "text-xl"} mb-2 hover:text-primary transition-colors`}>
            {post.title}
          </h3>
        </Link>
        <p className="text-muted-foreground line-clamp-2">{post.excerpt}</p>
      </CardContent>
      <CardFooter className="p-4 md:p-6 pt-0">
        <Link href={`/${post.category}/${post.slug}`} className="text-primary hover:underline">
          Read more →
        </Link>
      </CardFooter>
    </Card>
  )
}
