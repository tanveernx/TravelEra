const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const { CLIENT_URL, NODE_ENV } = require("./config/env");
const apiRoutes = require("./routes/index");
const { errorMiddleware, notFoundMiddleware } = require("./middlewares/error.middleware");
const { apiLimiter } = require("./middlewares/rateLimiter.middleware");

const app = express();

// --- Core middleware ---
app.use(helmet());
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (NODE_ENV !== "test") {
  app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));
}

app.use("/api/v1", apiLimiter, apiRoutes);

app.get("/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

// --- Error handling (must be last) ---
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;
