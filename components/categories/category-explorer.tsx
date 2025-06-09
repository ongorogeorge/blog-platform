"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCategories } from "@/lib/actions/category-actions"
import { getPosts } from "@/lib/actions/post-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { FolderOpen } from "lucide-react"

type Category = {
  _id: string
  name: string
  slug: string
  description?: string
}

type CategoryWithCount = Category & {
  postCount: number
}

export default function CategoryExplorer() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCategoriesWithCounts() {
      try {
        const categoriesData = await getCategories()

        // Get post counts for each category
        const categoriesWithCounts = await Promise.all(
          categoriesData.map(async (category: Category) => {
            const { posts } = await getPosts(1, 1, category.slug)
            const { pagination } = await getPosts(1000, 1, category.slug) // Get total count

            return {
              ...category,
              postCount: pagination.total,
            }
          }),
        )

        setCategories(categoriesWithCounts)
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategoriesWithCounts()
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Explore by Categories</h2>
          <p className="text-muted-foreground">Discover posts organized by topics</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">No Categories Yet</h2>
        <p className="text-muted-foreground">Categories will appear here once posts are published.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Explore by Categories</h2>
        <p className="text-muted-foreground">Discover posts organized by topics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link key={category._id} href={`/${category.slug}`}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    {category.name}
                  </CardTitle>
                  <Badge variant="secondary">
                    {category.postCount} {category.postCount === 1 ? "post" : "posts"}
                  </Badge>
                </div>
                <CardDescription>/{category.slug}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {category.description || `Explore all posts in ${category.name}`}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
