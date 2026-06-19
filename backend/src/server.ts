import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./db/prisma.js";

const app = createApp();

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`CustomHub Node API running on http://0.0.0.0:${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down.`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));
