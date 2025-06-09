import mongoose, { Schema, models } from "mongoose"

const NewsletterSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Please provide an email address."],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribeToken: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
)

export default models.Newsletter || mongoose.model("Newsletter", NewsletterSchema)
