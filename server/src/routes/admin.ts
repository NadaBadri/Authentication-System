import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { User } from "../models/User.js";

const router = Router();

router.use(requireAuth, requireAdmin);

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

export default router;

