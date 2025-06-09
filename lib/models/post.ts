import mongoose, { Schema, models } from "mongoose"

const PostSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide a title for this post."],
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Please provide a slug for this post."],
      unique: true,
    },
    content: {
      type: String,
      required: [true, "Please provide content for this post."],
    },
    excerpt: {
      type: String,
      required: [true, "Please provide an excerpt for this post."],
      maxlength: [200, "Excerpt cannot be more than 200 characters"],
    },
    category: {
      type: String,
      required: [true, "Please specify a category for this post."],
    },
    coverImage: {
      type: String,
      required: [true, "Please provide a cover image URL for this post."],
    },
    published: {
      type: Boolean,
      default: false,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

// Create a compound index on category and slug for efficient URL lookups
PostSchema.index({ category: 1, slug: 1 }, { unique: true })

export default models.Post || mongoose.model("Post", PostSchema)
