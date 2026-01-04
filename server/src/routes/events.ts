import { Router } from "express";
import mongoose from "mongoose";
import { Event } from "../models/Event.js";

const router = Router();

// Public: list upcoming active events
router.get("/", async (_req, res) => {
  const now = new Date();
  const events = await Event.find({ isActive: true, endAt: { $gte: now } })
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

// Public: event detail
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ error: "Invalid event id" });

  const e = await Event.findById(req.params.id)
    .select("_id title description location startAt endAt capacity requiresApproval isActive createdAt updatedAt")
    .lean();

  if (!e || !e.isActive) return res.status(404).json({ error: "Event not found" });

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

export default router;

