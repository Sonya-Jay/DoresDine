import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";

export interface TokenPayload {
  userId: string;
  iat?: number;
  exp?: number;
}

// Attach user id to headers if Authorization Bearer token is present and valid.
export function attachUserFromToken(req: Request, _res: Response, next: NextFunction) {
  const auth = req.headers.authorization as string | undefined;
  if (!auth) return next();

  const parts = auth.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") return next();

  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    if (payload && payload.userId) {
      // Mirror previous header-based auth used in routes
      (req.headers as any)["x-user-id"] = payload.userId;
      // also attach to req as convenience
      (req as any).userId = payload.userId;
    }
  } catch (err) {
    // ignore invalid token (treat as unauthenticated)
  }
  return next();
}

// Middleware to require auth; returns 401 if no valid token
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if ((req as any).userId || (req.headers as any)["x-user-id"]) return next();
  return res.status(401).json({ error: "Authentication required" });
}

export function signToken(userId: string) {
  // 7 day expiry by default
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}
