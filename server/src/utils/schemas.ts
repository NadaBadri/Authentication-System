import { z } from "zod";

export const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const eventBaseSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(4000).optional().default(""),
  location: z.string().max(200).optional().default(""),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  capacity: z.number().int().min(0).optional().default(0),
  requiresApproval: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true)
});

export const eventCreateSchema = eventBaseSchema.refine((v) => new Date(v.endAt).getTime() > new Date(v.startAt).getTime(), {
    message: "endAt must be after startAt",
    path: ["endAt"]
  });

export const eventUpdateSchema = eventBaseSchema.partial().refine(
  (v: Partial<z.infer<typeof eventBaseSchema>>) => {
    if (!v.startAt || !v.endAt) return true;
    return new Date(v.endAt).getTime() > new Date(v.startAt).getTime();
  },
  { message: "endAt must be after startAt", path: ["endAt"] }
);

export const bookingCreateSchema = z.object({
  eventId: objectIdSchema
});

export const bookingStatusSchema = z.object({
  status: z.enum(["pending", "approved", "cancelled"])
});

