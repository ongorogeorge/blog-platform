import mongoose, { Schema, models } from "mongoose"

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name for this category."],
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    slug: {
      type: String,
      required: [true, "Please provide a slug for this category."],
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  },
)

export default models.Category || mongoose.model("Category", CategorySchema)
