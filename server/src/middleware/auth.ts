import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { User, type UserRole } from "../models/User.js";
import { verifyAuthToken } from "../utils/jwt.js";

export const AUTH_COOKIE_NAME = "token";

export type AuthContext = {
  userId: string;
  role: UserRole;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      auth?: AuthContext;
      user?: { id: string; email: string; name: string; role: UserRole };
    }
  }
}

function unauthorized(res: Response, message = "Unauthorized") {
  return res.status(401).json({ error: message });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[AUTH_COOKIE_NAME] as string | undefined;
  if (!token) return unauthorized(res);

  try {
    const payload = verifyAuthToken(token);
    if (!payload?.sub || !payload.role) return unauthorized(res);
    if (!mongoose.isValidObjectId(payload.sub)) return unauthorized(res);

    const user = await User.findById(payload.sub).select("_id email name role").lean();
    if (!user) return unauthorized(res);

    req.auth = { userId: String(user._id), role: user.role };
    req.user = { id: String(user._id), email: user.email, name: user.name, role: user.role };
    return next();
  } catch {
    return unauthorized(res);
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return unauthorized(res);
  if (req.user.role !== "admin") return res.status(403).json({ error: "Forbidden" });
  return next();
}

