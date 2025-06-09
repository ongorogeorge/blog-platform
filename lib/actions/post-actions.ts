"use server"

import connectDB from "@/lib/db"
import Post from "@/lib/models/post"
import { revalidatePath } from "next/cache"

export async function getPosts(limit = 10, page = 1, category?: string) {
  try {
    await connectDB()

    const skip = (page - 1) * limit
    const query = category ? { category, published: true } : { published: true }

    const posts = await Post.find(query).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean()

    const total = await Post.countDocuments(query)

    return {
      posts: JSON.parse(JSON.stringify(posts)),
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    }
  } catch (error) {
    console.error("Error fetching posts:", error)
    return {
      posts: [],
      pagination: {
        total: 0,
        page: 1,
        pages: 0,
      },
    }
  }
}

export async function getPostBySlug(category: string, slug: string) {
  try {
    await connectDB()

    const post = await Post.findOne({ category, slug, published: true }).lean()

    if (!post) {
      return null
    }

    return JSON.parse(JSON.stringify(post))
  } catch (error) {
    console.error("Error fetching post:", error)
    return null
  }
}

export async function getAllPosts() {
  try {
    await connectDB()

    const posts = await Post.find().sort({ createdAt: -1 }).lean()

    return JSON.parse(JSON.stringify(posts))
  } catch (error) {
    console.error("Error fetching all posts:", error)
    return []
  }
}

export async function createPost(postData: {
  title: string
  slug: string
  content: string
  excerpt: string
  category: string
  coverImage: string
  published: boolean
}) {
  try {
    await connectDB()

    // Check if slug already exists in the same category
    const existingPost = await Post.findOne({
      category: postData.category,
      slug: postData.slug,
    })

    if (existingPost) {
      throw new Error("A post with this slug already exists in this category")
    }

    const { published } = postData

    const newPost = new Post({
      ...postData,
      publishedAt: published ? new Date() : null,
    })

    await newPost.save()

    // Revalidate relevant paths
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/posts")
    revalidatePath(`/${postData.category}`)

    return JSON.parse(JSON.stringify(newPost))
  } catch (error) {
    console.error("Error creating post:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create post")
  }
}

export async function updatePost(
  id: string,
  postData: {
    title: string
    slug: string
    content: string
    excerpt: string
    category: string
    coverImage: string
    published: boolean
  },
) {
  try {
    await connectDB()

    const post = await Post.findById(id)

    if (!post) {
      throw new Error("Post not found")
    }

    // Check if slug already exists in the same category (excluding current post)
    const existingPost = await Post.findOne({
      category: postData.category,
      slug: postData.slug,
      _id: { $ne: id },
    })

    if (existingPost) {
      throw new Error("A post with this slug already exists in this category")
    }

    const { published } = postData

    // If post is being published for the first time
    if (published && !post.publishedAt) {
      postData.publishedAt = new Date()
    }

    // If post is being unpublished
    if (!published) {
      postData.publishedAt = null
    }

    const updatedPost = await Post.findByIdAndUpdate(id, postData, {
      new: true,
      runValidators: true,
    })

    // Revalidate relevant paths
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/posts")
    revalidatePath(`/${postData.category}`)
    revalidatePath(`/${postData.category}/${postData.slug}`)

    return JSON.parse(JSON.stringify(updatedPost))
  } catch (error) {
    console.error("Error updating post:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update post")
  }
}

export async function deletePost(id: string) {
  try {
    await connectDB()

    const post = await Post.findById(id)

    if (!post) {
      throw new Error("Post not found")
    }

    await Post.findByIdAndDelete(id)

    // Revalidate relevant paths
    revalidatePath("/")
    revalidatePath("/admin")
    revalidatePath("/admin/posts")
    revalidatePath(`/${post.category}`)

    return { success: true }
  } catch (error) {
    console.error("Error deleting post:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete post")
  }
}

export async function getPostById(id: string) {
  try {
    await connectDB()

    const post = await Post.findById(id).lean()

    if (!post) {
      return null
    }

    return JSON.parse(JSON.stringify(post))
  } catch (error) {
    console.error("Error fetching post by ID:", error)
    return null
  }
}
