import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { Booking } from "../models/Booking.js";
import { Event } from "../models/Event.js";
import { User } from "../models/User.js";
import { bookingStatusSchema, eventCreateSchema, eventUpdateSchema } from "../utils/schemas.js";

const router = Router();

router.use(requireAuth, requireAdmin);

type PopulatedUser = { _id: unknown; email: string; name: string; role: "user" | "admin" };
type PopulatedEvent = {
  _id: unknown;
  title: string;
  location: string;
  startAt: Date;
  endAt: Date;
  requiresApproval: boolean;
  isActive: boolean;
};

router.get("/users", async (_req, res) => {
  const users = await User.find({})
    .select("_id email name role createdAt updatedAt")
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    users: users.map((u) => ({
      id: String(u._id),
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt
    }))
  });
});

const updateRoleSchema = z.object({
  role: z.enum(["user", "admin"])
});

router.patch("/users/:id/role", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid user id" });

  const parsed = updateRoleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const updated = await User.findByIdAndUpdate(
    req.params.id,
    { $set: { role: parsed.data.role } },
    { new: true }
  )
    .select("_id email name role")
    .lean();

  if (!updated) return res.status(404).json({ error: "User not found" });

  return res.json({
    user: { id: String(updated._id), email: updated.email, name: updated.name, role: updated.role }
  });
});

// Events CRUD
router.get("/events", async (_req, res) => {
  const events = await Event.find({})
    .select("_id title description location startAt endAt capacity requiresApproval isActive createdAt updatedAt")
    .sort({ startAt: 1 })
    .lean();

  return res.json({
    events: events.map((e) => ({
      id: String(e._id),
      title: e.title,
      description: e.description,
      location: e.location,
      startAt: e.startAt,
      endAt: e.endAt,
      capacity: e.capacity,
      requiresApproval: e.requiresApproval,
      isActive: e.isActive,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }))
  });
});

router.post("/events", async (req, res) => {
  const parsed = eventCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const event = await Event.create({
    title: parsed.data.title,
    description: parsed.data.description,
    location: parsed.data.location,
    startAt: new Date(parsed.data.startAt),
    endAt: new Date(parsed.data.endAt),
    capacity: parsed.data.capacity,
    requiresApproval: parsed.data.requiresApproval,
    isActive: parsed.data.isActive
  });

  return res.status(201).json({ event: { id: String(event._id) } });
});

router.get("/events/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid event id" });
  const e = await Event.findById(req.params.id)
    .select("_id title description location startAt endAt capacity requiresApproval isActive createdAt updatedAt")
    .lean();
  if (!e) return res.status(404).json({ error: "Event not found" });
  return res.json({
    event: {
      id: String(e._id),
      title: e.title,
      description: e.description,
      location: e.location,
      startAt: e.startAt,
      endAt: e.endAt,
      capacity: e.capacity,
      requiresApproval: e.requiresApproval,
      isActive: e.isActive,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }
  });
});

router.patch("/events/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid event id" });
  const parsed = eventUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const update: Record<string, unknown> = {};
  if (parsed.data.title !== undefined) update.title = parsed.data.title;
  if (parsed.data.description !== undefined) update.description = parsed.data.description;
  if (parsed.data.location !== undefined) update.location = parsed.data.location;
  if (parsed.data.startAt !== undefined) update.startAt = new Date(parsed.data.startAt);
  if (parsed.data.endAt !== undefined) update.endAt = new Date(parsed.data.endAt);
  if (parsed.data.capacity !== undefined) update.capacity = parsed.data.capacity;
  if (parsed.data.requiresApproval !== undefined) update.requiresApproval = parsed.data.requiresApproval;
  if (parsed.data.isActive !== undefined) update.isActive = parsed.data.isActive;

  const e = await Event.findByIdAndUpdate(req.params.id, { $set: update }, { new: true })
    .select("_id title description location startAt endAt capacity requiresApproval isActive createdAt updatedAt")
    .lean();
  if (!e) return res.status(404).json({ error: "Event not found" });

  return res.json({
    event: {
      id: String(e._id),
      title: e.title,
      description: e.description,
      location: e.location,
      startAt: e.startAt,
      endAt: e.endAt,
      capacity: e.capacity,
      requiresApproval: e.requiresApproval,
      isActive: e.isActive,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt
    }
  });
});

// Bookings management
router.get("/bookings", async (req, res) => {
  const status = req.query.status;
  const filter: Record<string, unknown> = {};
  if (typeof status === "string" && ["pending", "approved", "cancelled"].includes(status)) {
    filter.status = status;
  }

  const bookings = await Booking.find(filter)
    .populate({ path: "userId", select: "_id email name role" })
    .populate({ path: "eventId", select: "_id title location startAt endAt requiresApproval isActive" })
    .sort({ createdAt: -1 })
    .lean();

  return res.json({
    bookings: bookings.map((b) => ({
      id: String(b._id),
      status: b.status,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      user: b.userId && typeof b.userId === "object"
        ? {
            id: String((b.userId as unknown as PopulatedUser)._id),
            email: (b.userId as unknown as PopulatedUser).email,
            name: (b.userId as unknown as PopulatedUser).name,
            role: (b.userId as unknown as PopulatedUser).role
          }
        : null,
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

router.patch("/bookings/:id/status", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid booking id" });
  const parsed = bookingStatusSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Booking not found" });

  // Enforce capacity when approving
  if (parsed.data.status === "approved") {
    const event = await Event.findById(booking.eventId).lean();
    if (!event) return res.status(400).json({ error: "Event not found for this booking" });
    if (event.capacity > 0) {
      const approvedCount = await Booking.countDocuments({ eventId: booking.eventId, status: "approved" });
      const willConsumeSeat = booking.status !== "approved";
      if (willConsumeSeat && approvedCount >= event.capacity) return res.status(409).json({ error: "Event is full" });
    }
  }

  booking.status = parsed.data.status;
  await booking.save();
  return res.json({ booking: { id: String(booking._id), status: booking.status } });
});

export default router;

