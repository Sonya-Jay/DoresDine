"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("./db"));
const auth_1 = require("./middleware/auth");
const auth_2 = __importDefault(require("./routes/auth"));
const dining_1 = __importDefault(require("./routes/dining"));
const follows_1 = __importDefault(require("./routes/follows"));
const posts_1 = __importDefault(require("./routes/posts"));
const search_1 = __importDefault(require("./routes/search"));
const upload_1 = __importDefault(require("./routes/upload"));
const users_1 = __importDefault(require("./routes/users"));
const app = (0, express_1.default)();
const PORT = Number(process.env.PORT) || 3000;
// Middleware
// Apply JSON parsing conditionally - skip for upload routes (multer needs raw body)
// Increase body size limit for JSON (for large posts with many photos)
app.use((req, res, next) => {
    // Skip JSON parsing for file upload routes (multer needs raw multipart/form-data)
    if (req.path.startsWith('/upload')) {
        return next();
    }
    // Apply JSON parsing with increased limit for other routes
    express_1.default.json({ limit: '20mb' })(req, res, next);
});
// Attach user from Authorization Bearer token (optional)
app.use(auth_1.attachUserFromToken);
// Serve uploaded files statically
app.use("/uploads", express_1.default.static("uploads"));
// Request logging (simple)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
    next();
});
// Routes
app.use("/auth", auth_2.default);
app.use("/users", users_1.default);
app.use("/posts", posts_1.default);
app.use("/follows", follows_1.default);
app.use("/search", search_1.default);
app.use("/upload", upload_1.default);
app.use("/api/dining", dining_1.default);
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
        await db_1.default.query("SELECT 1");
        res.json({ status: "ok", database: "connected" });
    }
    catch (error) {
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
    await db_1.default.end();
    process.exit(0);
});
