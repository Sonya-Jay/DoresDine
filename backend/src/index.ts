import cors from "cors";
import "dotenv/config";
import express from "express";
import pool from "./db";
import { attachUserFromToken } from "./middleware/auth";
import authRouter from "./routes/auth";
import diningRouter from "./routes/dining";
import followsRouter from "./routes/follows";
import postsRouter from "./routes/posts";
import searchRouter from "./routes/search";
import uploadRouter from "./routes/upload";
import usersRouter from "./routes/users";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// CORS configuration - allow requests from frontend
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, Postman, curl)
    if (!origin) return callback(null, true);
    
    // Allow localhost on any port
    if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    // Allow local network IPs (for mobile devices on same network)
    if (/^http:\/\/192\.168\.\d+\.\d+:\d+$/.test(origin) || /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/.test(origin)) {
      return callback(null, true);
    }
    
    // Allow specific origins
    const allowedOrigins = [
      'http://localhost:8081',
      'http://localhost:19006',
      'http://localhost:3000',
    ];
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Default: allow the request (for development)
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  exposedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware
// Apply JSON parsing conditionally - skip for upload routes (multer needs raw body)
// Increase body size limit for JSON (for large posts with many photos)
app.use((req, res, next) => {
  // Skip JSON parsing for file upload routes (multer needs raw multipart/form-data)
  if (req.path.startsWith('/upload')) {
    return next();
  }
  // Apply JSON parsing with increased limit for other routes
  express.json({ limit: '50mb' })(req, res, next);
});

// Attach user from Authorization Bearer token (optional)
app.use(attachUserFromToken);

// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));

// Request logging (simple)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/posts", postsRouter);
app.use("/follows", followsRouter);
app.use("/search", searchRouter);
app.use("/upload", uploadRouter);
app.use("/api/dining", diningRouter);

// Health check
// app.get("/health", async (req, res) => {
//   try {
//     await pool.query("SELECT 1");
//     res.json({ status: "ok", database: "connected" });
//   } catch (error) {
//     res.status(503).json({ status: "error", database: "disconnected" });
//   }
// });
app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (error: any) {
    console.error("DB ERROR:", error.message, error);
    res.status(503).json({
      status: "error",
      database: "disconnected",
      message: error.message,
      detail: error.detail || null,
      code: error.code || null,
    });
  }
});

// Checking database
app.get("/debug-env", (req, res) => {
  res.json({
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: /health`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server...");
  await pool.end();
  process.exit(0);
});
