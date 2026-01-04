import { Router } from "express";
import mongoose from "mongoose";
import { requireAuth } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Event } from "../models/Event.js";
import { bookingCreateSchema } from "../utils/schemas.js";

const router = Router();

router.use(requireAuth);

type PopulatedEvent = {
  _id: unknown;
  title: string;
  location: string;
  startAt: Date;
  endAt: Date;
  requiresApproval: boolean;
  isActive: boolean;
};

router.get("/me", async (req, res) => {
  const bookings = await Booking.find({ userId: req.auth!.userId })
    .populate({ path: "eventId", select: "_id title location startAt endAt requiresApproval isActive" })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    bookings: bookings.map((b) => ({
      id: String(b._id),
      status: b.status,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      event: b.eventId && typeof b.eventId === "object"
        ? {
            id: String((b.eventId as unknown as PopulatedEvent)._id),
            title: (b.eventId as unknown as PopulatedEvent).title,
            location: (b.eventId as unknown as PopulatedEvent).location,
            startAt: (b.eventId as unknown as PopulatedEvent).startAt,
            endAt: (b.eventId as unknown as PopulatedEvent).endAt,
            requiresApproval: (b.eventId as unknown as PopulatedEvent).requiresApproval,
            isActive: (b.eventId as unknown as PopulatedEvent).isActive
          }
        : null
    }))
  });
});

router.post("/", async (req, res) => {
  const parsed = bookingCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const eventId = parsed.data.eventId;
  const event = await Event.findById(eventId).lean();
  if (!event || !event.isActive) return res.status(404).json({ error: "Event not found" });

  const now = new Date();
  if (event.endAt.getTime() < now.getTime()) return res.status(400).json({ error: "Event has already ended" });

  const status = event.requiresApproval ? "pending" : "approved";

  // If auto-approved and capacity is set, enforce it
  if (!event.requiresApproval && event.capacity > 0) {
    const approvedCount = await Booking.countDocuments({ eventId, status: "approved" });
    if (approvedCount >= event.capacity) return res.status(409).json({ error: "Event is full" });
  }

  try {
    const booking = await Booking.create({
      userId: new mongoose.Types.ObjectId(req.auth!.userId),
      eventId: new mongoose.Types.ObjectId(eventId),
      status
    });
    return res.status(201).json({ booking: { id: String(booking._id), status: booking.status } });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code?: unknown }).code === 11000) {
      return res.status(409).json({ error: "You already booked this event" });
    }
    throw err;
  }
});

router.post("/:id/cancel", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid booking id" });

  const booking = await Booking.findOne({ _id: req.params.id, userId: req.auth!.userId });
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  if (booking.status === "cancelled") return res.json({ booking: { id: String(booking._id), status: booking.status } });

  booking.status = "cancelled";
  await booking.save();
  return res.json({ booking: { id: String(booking._id), status: booking.status } });
});

export default router;

