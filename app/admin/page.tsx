import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAllPosts } from "@/lib/actions/post-actions"
import { getCategories } from "@/lib/actions/category-actions"
import { getAllSubscribers } from "@/lib/actions/newsletter-actions"
import { FileText, FolderOpen, Plus, Mail } from "lucide-react"

export default async function AdminDashboard() {
  const [posts, categories, subscribers] = await Promise.all([getAllPosts(), getCategories(), getAllSubscribers()])

  const publishedPosts = posts.filter((post) => post.published)
  const draftPosts = posts.filter((post) => !post.published)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/posts/new">
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Posts</CardTitle>
            <CardDescription>All blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Published</CardTitle>
            <CardDescription>Live posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{publishedPosts.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Categories</CardTitle>
            <CardDescription>Post categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Subscribers</CardTitle>
            <CardDescription>Newsletter subscribers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{subscribers.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Recent Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {posts.length > 0 ? (
              <ul className="space-y-2">
                {posts.slice(0, 5).map((post) => (
                  <li key={post._id} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${post.published ? "bg-green-500" : "bg-amber-500"}`}
                      />
                      <span className="truncate text-sm">{post.title}</span>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/posts/${post._id}`}>Edit</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No posts yet.</p>
            )}

            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/posts">View All Posts</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FolderOpen className="mr-2 h-5 w-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category._id} className="flex items-center justify-between border-b pb-2">
                    <span className="text-sm">{category.name}</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/${category.slug}`}>View</Link>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No categories yet.</p>
            )}

            <div className="mt-4">
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/categories">Manage Categories</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5" />
              Newsletter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="text-2xl font-bold">{subscribers.length}</div>
                <p className="text-sm text-muted-foreground">Active subscribers</p>
              </div>

              <div className="space-y-2">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href="/admin/newsletter">Send Newsletter</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
