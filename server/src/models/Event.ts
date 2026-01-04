import mongoose, { type InferSchemaType, type Model } from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 4000 },
    location: { type: String, default: "", maxlength: 200 },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    capacity: { type: Number, default: 0, min: 0 },
    requiresApproval: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

eventSchema.index({ startAt: 1, isActive: 1 });

export type EventDoc = InferSchemaType<typeof eventSchema> & { _id: mongoose.Types.ObjectId };

export const Event: Model<EventDoc> = mongoose.models.Event
  ? (mongoose.models.Event as Model<EventDoc>)
  : mongoose.model<EventDoc>("Event", eventSchema);

