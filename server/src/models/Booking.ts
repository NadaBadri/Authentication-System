import mongoose, { type InferSchemaType, type Model } from "mongoose";

export type BookingStatus = "pending" | "approved" | "cancelled";

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true, index: true },
    status: { type: String, enum: ["pending", "approved", "cancelled"], default: "pending", index: true }
  },
  { timestamps: true }
);

bookingSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export type BookingDoc = InferSchemaType<typeof bookingSchema> & { _id: mongoose.Types.ObjectId };

export const Booking: Model<BookingDoc> = mongoose.models.Booking
  ? (mongoose.models.Booking as Model<BookingDoc>)
  : mongoose.model<BookingDoc>("Booking", bookingSchema);

