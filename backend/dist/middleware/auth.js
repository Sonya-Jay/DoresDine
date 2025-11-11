"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachUserFromToken = attachUserFromToken;
exports.requireAuth = requireAuth;
exports.signToken = signToken;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
// Attach user id to headers if Authorization Bearer token is present and valid.
function attachUserFromToken(req, _res, next) {
    const auth = req.headers.authorization;
    if (!auth)
        return next();
    const parts = auth.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
        return next();
    const token = parts[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        if (payload && payload.userId) {
            // Mirror previous header-based auth used in routes
            req.headers["x-user-id"] = payload.userId;
            // also attach to req as convenience
            req.userId = payload.userId;
        }
    }
    catch (err) {
        // ignore invalid token (treat as unauthenticated)
    }
    return next();
}
// Middleware to require auth; returns 401 if no valid token
function requireAuth(req, res, next) {
    if (req.userId || req.headers["x-user-id"])
        return next();
    return res.status(401).json({ error: "Authentication required" });
}
function signToken(userId) {
    // 7 day expiry by default
    return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
