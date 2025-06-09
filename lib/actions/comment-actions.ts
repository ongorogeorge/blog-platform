"use server"

import connectDB from "@/lib/db"
import Comment from "@/lib/models/comment"
import { revalidatePath } from "next/cache"

export async function getCommentsByPostId(postId: string) {
  try {
    await connectDB()

    const comments = await Comment.find({ postId, parentId: null })
      .populate("userId", "name email avatar")
      .sort({ createdAt: -1 })
      .lean()

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (comment) => {
        const replies = await Comment.find({ parentId: comment._id })
          .populate("userId", "name email avatar")
          .sort({ createdAt: 1 })
          .lean()

        return {
          ...comment,
          replies: JSON.parse(JSON.stringify(replies)),
          upvoteCount: comment.upvotes?.length || 0,
          downvoteCount: comment.downvotes?.length || 0,
        }
      }),
    )

    return JSON.parse(JSON.stringify(commentsWithReplies))
  } catch (error) {
    console.error("Error fetching comments:", error)
    return []
  }
}

export async function createComment(postId: string, userId: string, content: string, parentId?: string) {
  try {
    await connectDB()

    const newComment = new Comment({
      postId,
      userId,
      content,
      parentId: parentId || null,
    })

    await newComment.save()

    revalidatePath(`/[category]/[slug]`, "page")

    return {
      success: true,
      comment: JSON.parse(JSON.stringify(newComment)),
    }
  } catch (error) {
    console.error("Error creating comment:", error)
    return {
      success: false,
      message: "Failed to create comment",
    }
  }
}

export async function voteComment(commentId: string, userId: string, voteType: "upvote" | "downvote") {
  try {
    await connectDB()

    const comment = await Comment.findById(commentId)

    if (!comment) {
      return { success: false, message: "Comment not found" }
    }

    // Remove existing votes by this user
    comment.upvotes = comment.upvotes.filter((id: any) => id.toString() !== userId)
    comment.downvotes = comment.downvotes.filter((id: any) => id.toString() !== userId)

    // Add new vote
    if (voteType === "upvote") {
      comment.upvotes.push(userId)
    } else {
      comment.downvotes.push(userId)
    }

    await comment.save()

    revalidatePath(`/[category]/[slug]`, "page")

    return {
      success: true,
      upvoteCount: comment.upvotes.length,
      downvoteCount: comment.downvotes.length,
    }
  } catch (error) {
    console.error("Error voting on comment:", error)
    return {
      success: false,
      message: "Failed to vote on comment",
    }
  }
}
