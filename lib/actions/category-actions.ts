"use server"

import connectDB from "@/lib/db"
import Category from "@/lib/models/category"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  try {
    await connectDB()

    const categories = await Category.find().sort({ name: 1 }).lean()

    return JSON.parse(JSON.stringify(categories))
  } catch (error) {
    console.error("Error fetching categories:", error)
    throw new Error("Failed to fetch categories")
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    await connectDB()

    const category = await Category.findOne({ slug }).lean()

    if (!category) {
      return null
    }

    return JSON.parse(JSON.stringify(category))
  } catch (error) {
    console.error("Error fetching category:", error)
    return null
  }
}

export async function createCategory(categoryData: { name: string; slug: string; description?: string }) {
  try {
    await connectDB()

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug: categoryData.slug })

    if (existingCategory) {
      throw new Error("A category with this slug already exists")
    }

    const newCategory = new Category(categoryData)

    await newCategory.save()

    // Revalidate paths
    revalidatePath("/admin/categories")
    revalidatePath("/admin/posts/new")
    revalidatePath("/")

    return JSON.parse(JSON.stringify(newCategory))
  } catch (error) {
    console.error("Error creating category:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to create category")
  }
}

export async function updateCategory(id: string, categoryData: { name: string; slug: string; description?: string }) {
  try {
    await connectDB()

    // Check if slug already exists (excluding current category)
    const existingCategory = await Category.findOne({
      slug: categoryData.slug,
      _id: { $ne: id },
    })

    if (existingCategory) {
      throw new Error("A category with this slug already exists")
    }

    const updatedCategory = await Category.findByIdAndUpdate(id, categoryData, {
      new: true,
      runValidators: true,
    })

    if (!updatedCategory) {
      throw new Error("Category not found")
    }

    revalidatePath("/admin/categories")
    revalidatePath("/admin/posts/new")
    revalidatePath("/")

    return JSON.parse(JSON.stringify(updatedCategory))
  } catch (error) {
    console.error("Error updating category:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to update category")
  }
}

export async function deleteCategory(id: string) {
  try {
    await connectDB()

    const deletedCategory = await Category.findByIdAndDelete(id)

    if (!deletedCategory) {
      throw new Error("Category not found")
    }

    revalidatePath("/admin/categories")
    revalidatePath("/admin/posts/new")
    revalidatePath("/")

    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to delete category")
  }
}
