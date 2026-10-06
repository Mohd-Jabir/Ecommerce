import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
const addressSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },

    addressLine2: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true },
);

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    passwordHash: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    phone: {
      type: String,
      trim: true,
    },

    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    addresses: [addressSchema],
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);
//instance method
userSchema.methods.comparePassword = function (password) {
  const pepper = process.env.PEPPER;
  return bcrypt.compare(password + pepper, this.passwordHash);
};

//static method
userSchema.statics.isEmailTaken = async function (email) {
  return !!(await this.findOne({ email: email }));
};
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email }).select("+passwordHash");
};
//middelware(pre hooks)
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  const pepper = process.env.PEPPER;
  this.passwordHash = await bcrypt.hash(this.passwordHash + pepper, 12);
});
export const User = model("User", userSchema);
