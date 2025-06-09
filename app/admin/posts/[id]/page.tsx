"use client"

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getCategories } from "@/lib/actions/category-actions"
import { getPostById } from "@/lib/actions/post-actions"
import RichTextEditor from "@/components/editor/rich-text-editor"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

type EditPostPageProps = {
  params: {
    id: string
  }
}

function EditorSkeleton() {
  return (
    <Card className="w-full">
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-64 w-full" />
        </div>
      </CardContent>
    </Card>
  )
}

async function PostEditor({ id }: { id: string }) {
  try {
    const [post, categories] = await Promise.all([getPostById(id), getCategories()])

    if (!post) {
      notFound()
    }

    if (!categories || categories.length === 0) {
      return (
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No categories found. You need to create at least one category.
              </p>
              <a href="/admin/categories/new" className="text-primary hover:underline">
                Create a category first
              </a>
            </div>
          </CardContent>
        </Card>
      )
    }

    return <RichTextEditor post={post} categories={categories} />
  } catch (error) {
    console.error("Error loading post or categories:", error)
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">Error loading post data. Please try again.</p>
            <button onClick={() => window.location.reload()} className="text-primary hover:underline">
              Reload page
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }
}

export default function EditPostPage({ params }: EditPostPageProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground mt-2">Update the post details below.</p>
      </div>

      <Suspense fallback={<EditorSkeleton />}>
        <PostEditor id={params.id} />
      </Suspense>
    </div>
  )
}
