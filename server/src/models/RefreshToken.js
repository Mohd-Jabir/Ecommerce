import { Schema, model } from "mongoose";

const refreshTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

refreshTokenSchema.statics.findValidToken = function (tokenHash) {
  return this.findOne({
    tokenHash,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  });
};

refreshTokenSchema.methods.revoke = function () {
  this.revokedAt = new Date();
  return this.save();
};

export const RefreshToken = model("RefreshToken", refreshTokenSchema);
