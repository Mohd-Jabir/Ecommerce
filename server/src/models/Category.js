
import { Schema, model } from "mongoose";

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    image: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2048,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // User who created the category
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    createdByRole: {
      type: String,
      enum: ["admin", "vendor"],
      required: true,
    },
  },
  { timestamps: true }
);

categorySchema.index({ name: 1 });
categorySchema.index({ createdBy: 1, createdAt: -1 });

export const Category = model("Category", categorySchema);
