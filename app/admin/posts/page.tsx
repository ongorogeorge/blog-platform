"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getAllPosts, deletePost } from "@/lib/actions/post-actions"
import { formatDate } from "@/lib/utils/format-date"
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react"

type Post = {
  _id: string
  title: string
  slug: string
  excerpt: string
  category: string
  published: boolean
  publishedAt: string
  createdAt: string
  updatedAt: string
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { toast } = useToast()

  useEffect(() => {
    async function fetchPosts() {
      try {
        const data = await getAllPosts()
        setPosts(data)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPosts()
  }, [toast])

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) {
      return
    }

    setDeletingId(id)

    try {
      await deletePost(id)
      setPosts(posts.filter((post) => post._id !== id))
      toast({
        title: "Success!",
        description: "Post deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete post",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">All Posts</h1>
          <p className="text-muted-foreground mt-2">Manage your blog posts</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No posts found.</p>
              <Button asChild>
                <Link href="/admin/posts/new">Create your first post</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <Badge variant={post.published ? "default" : "secondary"}>
                        {post.published ? (
                          <>
                            <Eye className="mr-1 h-3 w-3" />
                            Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="mr-1 h-3 w-3" />
                            Draft
                          </>
                        )}
                      </Badge>
                    </div>
                    <CardDescription>
                      Category: {post.category} • Created: {formatDate(post.createdAt)}
                      {post.published && post.publishedAt && <> • Published: {formatDate(post.publishedAt)}</>}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/posts/${post._id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(post._id, post.title)}
                      disabled={deletingId === post._id}
                    >
                      {deletingId === post._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{post.excerpt}</p>
                <div className="flex gap-2">
                  {post.published && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${post.category}/${post.slug}`}>View Post</Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/posts/${post._id}`}>Edit</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
