import mongoose, { type InferSchemaType, type Model } from "mongoose";

export type UserRole = "user" | "admin";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const User: Model<UserDoc> = mongoose.models.User
  ? (mongoose.models.User as Model<UserDoc>)
  : mongoose.model<UserDoc>("User", userSchema);

