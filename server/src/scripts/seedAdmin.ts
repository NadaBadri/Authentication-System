import bcrypt from "bcryptjs";
import { connectDb } from "../utils/db.js";
import { env } from "../utils/env.js";
import { User } from "../models/User.js";

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "admin123456";
  const name = process.env.ADMIN_NAME ?? "Admin";

  if (!password || password.length < 8) {
    throw new Error("ADMIN_PASSWORD must be at least 8 characters");
  }

  await connectDb(env.mongoUri);

  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
      await existing.save();
      console.log(`[seed] promoted existing user to admin: ${email}`);
    } else {
      console.log(`[seed] admin already exists: ${email}`);
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await User.create({ email, name, passwordHash, role: "admin" });
  console.log(`[seed] created admin: ${email}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

