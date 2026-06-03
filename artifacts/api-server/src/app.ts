import express, { type Express, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import pinoHttp from "pino-http";
import cookieParser from "cookie-parser";
import router from "./routes";
import apiV1Router from "./routes/apiV1";
import { requestTimeout } from "./middlewares/requestTimeout";
import { logger } from "./lib/logger";
import { apiLimiter } from "./middlewares/rateLimit";
import { authMiddleware } from "./middlewares/auth";
import healthRouter from "./routes/health";

const app: Express = express();

app.use(helmet());

// Dynamic CORS configuration (avoiding wildcard '*')
const allowedOriginRegex = /^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?|https?:\/\/.*\.replit\.(app|dev|co)|https?:\/\/(.*\.)?filenova\.in)$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.) if they come from allowed origins or are from the same origin
      if (!origin) return callback(null, true);
      if (allowedOriginRegex.test(origin)) {
        return callback(null, true);
      }
      logger.warn({ origin }, "CORS: blocked request from disallowed origin");
      return callback(new Error("Not allowed by CORS policy"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// ── Body parsers (with size limits) ──────────────────────────────────────────
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());

// ── Health endpoints BEFORE authMiddleware (for load balancer probes) ───────────
// These must be mounted without auth for load balancer health checks to work
app.use("/api", healthRouter);

// ── Auth middleware ───────────────────────────────────────────────────────────
app.use(authMiddleware);

// ── Global rate limiting ──────────────────────────────────────────────────────
app.use(apiLimiter);

// Apply request timeout to API/processing routes
app.use("/api/v1", requestTimeout(30000), apiV1Router);
app.use("/api", requestTimeout(30000), router);

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, stack: err.stack }, "Unhandled error in API");

  // Ensure we always return valid JSON
  if (!res.headersSent) {
    res.status(500).json({
      error: "Internal server error",
      message: "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    });
  }
});

// Handle 404 for API routes
app.use("/api", (_req, res) => {
  res.status(404).json({ error: "API endpoint not found", timestamp: new Date().toISOString() });
});

import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend static assets with SPA fallback in production
if (process.env.NODE_ENV === "production") {
  const publicDir = path.resolve(__dirname, "../../file-nova/dist");
  app.use(express.static(publicDir));
  
  app.get(/.*/, (req, res, next) => {
    // If it starts with /api, pass it through so we don't accidentally serve index.html for API 404s
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

export default app;
