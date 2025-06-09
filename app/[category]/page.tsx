import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPosts } from "@/lib/actions/post-actions"
import { getCategoryBySlug } from "@/lib/actions/category-actions"
import PostCard from "@/components/post-card"

type CategoryPageProps = {
  params: {
    category: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = await getCategoryBySlug(params.category)

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: category.name,
    description: category.description || `Browse all posts in ${category.name}`,
    openGraph: {
      title: category.name,
      description: category.description || `Browse all posts in ${category.name}`,
    },
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryBySlug(params.category)

  if (!category) {
    notFound()
  }

  const { posts } = await getPosts(10, 1, params.category)

  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-2">{category.name}</h1>
        {category.description && <p className="text-muted-foreground mb-6">{category.description}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts found in this category.</p>
          </div>
        )}
      </section>
    </div>
  )
}
