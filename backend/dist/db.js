"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    // Only use SSL in production
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
// Test the connection immediately
pool
    .connect()
    .then((client) => {
    console.log("✅ Database connected successfully!");
    client.release();
})
    .catch((err) => {
    console.error("❌ Error connecting to database:", err);
    console.error("DATABASE_URL exists:", !!process.env.DATABASE_URL);
});
exports.default = pool;
