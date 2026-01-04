import { createApp } from "./app.js";
import { connectDb } from "./utils/db.js";
import { env } from "./utils/env.js";

async function main() {
  await connectDb(env.mongoUri);

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

