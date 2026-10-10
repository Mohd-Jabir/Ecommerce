import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

const USER_ROLES = ["customer", "vendor", "admin"];

const ACCOUNT_STATUSES = ["active", "suspended", "banned", "deactivated"];

function escapeRegex(value = "") {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : email;
}
const addressSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    addressLine1: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    addressLine2: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    state: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    country: {
      type: String,
      default: "India",
      trim: true,
      maxlength: 100,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  },
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
      maxlength: 254,
      index: true,
    },

    phone: {
      type: String,
      trim: true,
      default: null,
      maxlength: 20,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      default: "customer",
      lowercase: true,
      trim: true,
      index: true,
    },
    accountStatus: {
      type: String,
      enum: ACCOUNT_STATUSES,
      default: "active",
      lowercase: true,
      trim: true,
      index: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    addresses: {
      type: [addressSchema],
      default: [],
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  },
);
userSchema.index({
  accountStatus: 1,
  role: 1,
});
userSchema.index({
  isEmailVerified: 1,
  accountStatus: 1,
});

userSchema.virtual("fullName").get(function () {
  return this.name;
});

userSchema.methods.comparePassword = async function (password) {
  const pepper = process.env.PEPPER;
  if (!pepper) {
    throw new Error("PEPPER is not configured.");
  }
  if (!this.passwordHash) {
    throw new Error(
      "Password hash is unavailable. Select +passwordHash when querying.",
    );
  }
  return bcrypt.compare(password + pepper, this.passwordHash);
};
userSchema.methods.hasRole = function (role) {
  return this.role === role;
};
userSchema.methods.hasAnyRole = function (roles = []) {
  return roles.includes(this.role);
};
userSchema.methods.canLogin = function () {
  return this.accountStatus === "active";
};
userSchema.methods.canAccessAccount = function () {
  return this.canLogin() && this.isEmailVerified;
};
userSchema.methods.isPasswordResetTokenValid = function (issuedAt) {
  if (!Number.isFinite(issuedAt)) {
    return false;
  }
  if (!this.passwordChangedAt) {
    return true;
  }
  return issuedAt > Math.floor(this.passwordChangedAt.getTime() / 1000);
};
userSchema.statics.findByEmail = function (email) {
  return this.findOne({
    email: normalizeEmail(email),
  });
};
userSchema.statics.findByEmailWithPassword = function (email) {
  return this.findOne({
    email: normalizeEmail(email),
  }).select("+passwordHash");
};
userSchema.statics.findByUserId = function (id) {
  return this.findById(id);
};
userSchema.statics.isEmailTaken = async function (email, excludeUserId = null) {
  const filter = {
    email: normalizeEmail(email),
  };
  if (excludeUserId) {
    filter._id = { $ne: excludeUserId };
  }
  return Boolean(await this.exists(filter));
};
userSchema.statics.findActiveById = function (id) {
  return this.findOne({
    _id: id,
    accountStatus: "active",
  });
};
userSchema.statics.findVerifiedByEmail = function (email) {
  return this.findOne({
    email: normalizeEmail(email),
    isEmailVerified: true,
    accountStatus: "active",
  });
};
userSchema.statics.findByRole = function (role) {
  return this.find({ role });
};
//query helper
userSchema.query.active = function () {
  return this.where({
    accountStatus: "active",
  });
};

userSchema.query.verified = function () {
  return this.where({
    isEmailVerified: true,
  });
};

userSchema.query.unverified = function () {
  return this.where({
    isEmailVerified: false,
  });
};

userSchema.query.withRole = function (role) {
  return this.where({ role });
};

userSchema.query.withStatus = function (status) {
  return this.where({
    accountStatus: status,
  });
};

userSchema.query.createdAfter = function (date) {
  return this.where({
    createdAt: { $gte: date },
  });
};

userSchema.query.searchByName = function (search) {
  const value = search?.trim();

  if (!value) {
    return this;
  }

  return this.where({
    name: {
      $regex: escapeRegex(value),
      $options: "i",
    },
  });
};
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) {
    return;
  }
  const pepper = process.env.PEPPER;
  if (!pepper) {
    throw new Error("PEPPER is not configured.");
  }
  this.passwordHash = await bcrypt.hash(
    this.passwordHash + pepper,
    SALT_ROUNDS,
  );
  this.passwordChangedAt = new Date();
});
export const User = model("User", userSchema);
