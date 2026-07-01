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
import { sitemapRouter } from "./routes/sitemap";

const app: Express = express();

if (process.env.NODE_ENV === "production" && !process.env.CSRF_SECRET) {
  logger.warn("⚠️ CSRF_SECRET environment variable is missing in production mode. CSRF protection is running degraded.");
}

app.use(helmet());

const allowedOrigins = [
  "https://filenova.in",
  "https://www.filenova.in",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:4173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman, server-to-server)
      if (!origin) return callback(null, true);
      const isLocalhost = origin.startsWith("http://localhost:") || 
                          origin.startsWith("http://127.0.0.1:") || 
                          origin.startsWith("http://192.168.");
      if (allowedOrigins.includes(origin) || isLocalhost) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "X-Requested-With", "Accept"],
    credentials: true,
    optionsSuccessStatus: 204,
  })
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
app.use(
  express.json({
    limit: "50mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

// ── SEO: HTTP → HTTPS redirect ──────────────────────────────────────────────────
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] !== "https" && req.protocol !== "https") {
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }
  next();
});

// ── SEO: 301 redirects for legacy/alias URLs ────────────────────────────────────
app.use((req, res, next) => {
  const legacyMap: Record<string, string> = {
    "/ocr-pdf": "/ocr",
    "/pdf-merge": "/merge-pdf",
    "/image-to-pdf": "/jpg-to-pdf",
    "/pdf-to-image": "/pdf-to-jpg",
    "/resize-image": "/resize-photo",
  };
  const target = legacyMap[req.path];
  if (target) return res.redirect(301, target);
  next();
});

// ── Health endpoints BEFORE authMiddleware (for load balancer probes) ───────────
app.use("/api", healthRouter);
app.use(sitemapRouter);

// ── Auth middleware ───────────────────────────────────────────────────────────
app.use(authMiddleware);

// ── CSRF/Origin Validation middleware (Issue 3.4) ─────────────────────────────
app.use((req: Request, res: Response, next: NextFunction) => {
  // Only check mutating requests
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    const origin = req.headers.origin;
    const referer = req.headers.referer;

    // Validate Origin header if present
    if (origin) {
      const isLocalhost = origin.startsWith("http://localhost:") || 
                          origin.startsWith("http://127.0.0.1:") || 
                          origin.startsWith("http://192.168.");
      if (!allowedOrigins.includes(origin) && !isLocalhost) {
        logger.warn({ origin, path: req.path }, "CSRF Blocked: Invalid request origin");
        return res.status(403).json({ success: false, error: "CORS/CSRF verification failed: Invalid request origin" });
      }
    } else if (referer) {
      // Fallback to Referer validation
      try {
        const refererUrl = new URL(referer);
        const refererOrigin = refererUrl.origin;
        const isLocalhost = refererOrigin.startsWith("http://localhost:") || 
                            refererOrigin.startsWith("http://127.0.0.1:") || 
                            refererOrigin.startsWith("http://192.168.");
        if (!allowedOrigins.includes(refererOrigin) && !isLocalhost) {
          logger.warn({ refererOrigin, path: req.path }, "CSRF Blocked: Invalid request referer origin");
          return res.status(403).json({ success: false, error: "CORS/CSRF verification failed: Invalid request referer" });
        }
      } catch (_) {
        return res.status(400).json({ success: false, error: "Invalid Referer header format" });
      }
    } else if (process.env.NODE_ENV === "production") {
      // In production, require at least Origin or Referer for state mutations
      logger.warn({ path: req.path }, "CSRF Warning: Missing Origin and Referer header for mutation");
    }
  }
  next();
});

// ── Global rate limiting ──────────────────────────────────────────────────────
app.use(apiLimiter);

// Apply request timeout to API/processing routes
app.use("/api/v1", requestTimeout(30000), apiV1Router);
app.use("/api", requestTimeout(30000), router);

// Redirect fallback for short URLs /s/:id
app.get("/s/:id", (req, res) => {
  res.redirect(`/api/share/${req.params.id}`);
});

// ── Global error handler ─────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, stack: err.stack }, "Unhandled error in API");

  // Ensure we always return valid JSON
  if (!res.headersSent) {
    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: err.message || "An unexpected error occurred",
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
