
import { Schema, model } from "mongoose";

const VENDOR_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
];
const vendorSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    storeName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      maxlength: 120,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: "",
    },

    logo: {
      type: String,
      trim: true,
      default: "",
      maxlength: 2048,
    },

    contactEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },

    contactPhone: {
      type: String,
      trim: true,
      default: "",
      maxlength: 20,
    },

    businessAddress: {
      addressLine1: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },
      addressLine2: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },
      city: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },
      state: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
      },
      pincode: {
        type: String,
        trim: true,
        maxlength: 20,
        default: "",
      },
      country: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "India",
      },
    },

    status: {
      type: String,
      enum: VENDOR_STATUSES,
      default: "pending",
      index: true,
    },

    rejectionReason: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  },
);

vendorSchema.index({ status: 1, createdAt: -1 });

vendorSchema.statics.findByUserId = function (userId) {
  return this.findOne({ user: userId });
};

vendorSchema.statics.findApprovedByUserId = function (userId) {
  return this.findOne({
    user: userId,
    status: "approved",
  });
};

export const Vendor = model("Vendor", vendorSchema);
