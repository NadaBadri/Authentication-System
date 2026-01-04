import { Router, type Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { User } from "../models/User.js";
import { AUTH_COOKIE_NAME, requireAuth } from "../middleware/auth.js";
import { env } from "../utils/env.js";
import { signAuthToken } from "../utils/jwt.js";

const router = Router();

const registerSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(80),
  password: z.string().min(8).max(200)
});

const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200)
});

function setAuthCookie(res: Response, token: string) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.nodeEnv === "production",
    path: "/",
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });
}

router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const email = parsed.data.email.toLowerCase();
  const existing = await User.findOne({ email }).select("_id").lean();
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const user = await User.create({
    email,
    name: parsed.data.name,
    passwordHash,
    role: "user"
  });

  const token = signAuthToken({ sub: String(user._id), role: user.role });
  setAuthCookie(res, token);

  return res.status(201).json({
    user: { id: String(user._id), email: user.email, name: user.name, role: user.role }
  });
});

router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });

  const email = parsed.data.email.toLowerCase();
  const user = await User.findOne({ email }).select("_id email name role passwordHash").lean();
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAuthToken({ sub: String(user._id), role: user.role });
  setAuthCookie(res, token);

  return res.json({ user: { id: String(user._id), email: user.email, name: user.name, role: user.role } });
});

router.post("/logout", async (_req, res) => {
  res.clearCookie(AUTH_COOKIE_NAME, { path: "/" });
  return res.json({ ok: true });
});

router.get("/me", requireAuth, async (req, res) => {
  return res.json({ user: req.user });
});

export default router;

