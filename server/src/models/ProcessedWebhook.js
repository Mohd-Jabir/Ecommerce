import { Schema, model } from "mongoose";

const processedWebhookSchema = new Schema(
  {
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    processedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const ProcessedWebhook = model(
  "ProcessedWebhook",
  processedWebhookSchema,
);
