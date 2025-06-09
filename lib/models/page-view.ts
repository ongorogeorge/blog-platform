import mongoose, { Schema, models } from "mongoose"

const PageViewSchema = new Schema(
  {
    path: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userAgent: String,
    ip: String,
    referrer: String,
    sessionId: String,
  },
  {
    timestamps: true,
  },
)

// Index for efficient queries
PageViewSchema.index({ path: 1, createdAt: -1 })
PageViewSchema.index({ userId: 1, createdAt: -1 })

export default models.PageView || mongoose.model("PageView", PageViewSchema)
