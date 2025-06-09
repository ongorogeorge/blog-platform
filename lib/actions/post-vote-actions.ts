"use server"

import connectDB from "@/lib/db"
import PostVote from "@/lib/models/post-vote"
import Post from "@/lib/models/post"
import { revalidatePath } from "next/cache"

export async function votePost(postId: string, userId: string, voteType: "upvote" | "downvote") {
  try {
    await connectDB()

    // Check if post exists
    const post = await Post.findById(postId)
    if (!post) {
      return { success: false, message: "Post not found" }
    }

    // Check if user has already voted on this post
    const existingVote = await PostVote.findOne({ postId, userId })

    if (existingVote) {
      // If same vote type, remove the vote (toggle off)
      if (existingVote.voteType === voteType) {
        await PostVote.deleteOne({ _id: existingVote._id })
      } else {
        // If different vote type, update the vote
        existingVote.voteType = voteType
        await existingVote.save()
      }
    } else {
      // Create new vote
      const newVote = new PostVote({
        postId,
        userId,
        voteType,
      })
      await newVote.save()
    }

    // Get updated vote counts
    const upvotes = await PostVote.countDocuments({ postId, voteType: "upvote" })
    const downvotes = await PostVote.countDocuments({ postId, voteType: "downvote" })

    // Revalidate the post page
    revalidatePath(`/[category]/[slug]`)

    return {
      success: true,
      upvotes,
      downvotes,
      message: "Vote recorded successfully",
    }
  } catch (error) {
    console.error("Error voting on post:", error)
    return {
      success: false,
      message: "Failed to record vote",
    }
  }
}

export async function getPostVotes(postId: string) {
  try {
    await connectDB()

    const upvotes = await PostVote.countDocuments({ postId, voteType: "upvote" })
    const downvotes = await PostVote.countDocuments({ postId, voteType: "downvote" })

    return {
      success: true,
      upvotes,
      downvotes,
    }
  } catch (error) {
    console.error("Error getting post votes:", error)
    return {
      success: false,
      upvotes: 0,
      downvotes: 0,
      message: "Failed to get vote counts",
    }
  }
}

export async function getUserVote(postId: string, userId: string) {
  try {
    await connectDB()

    const vote = await PostVote.findOne({ postId, userId })

    return {
      success: true,
      voteType: vote ? vote.voteType : null,
    }
  } catch (error) {
    console.error("Error getting user vote:", error)
    return {
      success: false,
      voteType: null,
      message: "Failed to get user vote",
    }
  }
}
