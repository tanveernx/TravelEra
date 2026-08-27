const app = require("./app");
const connectDB = require("./config/db");
const { PORT } = require("./config/env");
const logger = require("./utils/logger");

let server;

async function start() {
  await connectDB();
  server = app.listen(PORT, () => {
    logger.success(`Travel Era API running on http://localhost:${PORT}`);
    logger.info(`API base: http://localhost:${PORT}/api/v1`);
  });
}

start();

// --- Graceful shutdown ---
function shutdown(signal) {
  logger.warn(`${signal} received. Shutting down gracefully...`);
  if (server) {
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
  // Force-exit if not closed within 10s
  setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection:", reason);
});
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});
