import mongoose, { Schema, models } from "mongoose"

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name."],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email address."],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address."],
    },
    avatar: {
      type: String,
      default: "",
    },
    preferences: {
      categories: [String],
      lastVisited: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    timestamps: true,
  },
)

export default models.User || mongoose.model("User", UserSchema)
