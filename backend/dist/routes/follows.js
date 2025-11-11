"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET /follows/following - Get list of users the current user is following (friends)
router.get("/following", async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "X-User-Id header is required" });
            return;
        }
        const query = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = $1
      ORDER BY f.created_at DESC
    `;
        const result = await db_1.default.query(query, [userId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching following:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /follows/followers - Get list of users following the current user
router.get("/followers", async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "X-User-Id header is required" });
            return;
        }
        const query = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        f.created_at as followed_at
      FROM follows f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = $1
      ORDER BY f.created_at DESC
    `;
        const result = await db_1.default.query(query, [userId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching followers:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /follows/activity - Get recent posts from users the current user is following
router.get("/activity", async (req, res) => {
    try {
        // Get userId from JWT token (attached by middleware) or fallback to header
        const userId = req.userId || req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "Authentication required" });
            return;
        }
        const query = `
      SELECT
        p.id,
        p.author_id,
        p.caption,
        CAST(p.rating AS FLOAT) as rating,
        p.menu_items,
        p.dining_hall_name,
        p.meal_type,
        p.created_at,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', pp.id,
              'storage_key', pp.storage_key,
              'display_order', pp.display_order
            ) ORDER BY pp.display_order
          ) FILTER (WHERE pp.id IS NOT NULL),
          '[]'::json
        ) as photos,
        COALESCE(l.like_count, 0) as like_count,
        COALESCE(c.comment_count, 0) as comment_count,
        CASE WHEN ul.user_id IS NOT NULL THEN true ELSE false END as is_liked
      FROM posts p
      JOIN users u ON p.author_id = u.id
      JOIN follows f ON p.author_id = f.following_id
      LEFT JOIN post_photos pp ON p.id = pp.post_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) as like_count
        FROM likes
        GROUP BY post_id
      ) l ON p.id = l.post_id
      LEFT JOIN (
        SELECT post_id, COUNT(*) as comment_count
        FROM comments
        GROUP BY post_id
      ) c ON p.id = c.post_id
      LEFT JOIN likes ul ON p.id = ul.post_id AND ul.user_id = $1
      WHERE f.follower_id = $1
      GROUP BY p.id, p.author_id, p.caption, p.rating, p.menu_items, p.dining_hall_name, p.meal_type, p.created_at, u.username, u.email, u.first_name, u.last_name, l.like_count, c.comment_count, ul.user_id
      ORDER BY p.created_at DESC
      LIMIT 50
    `;
        const result = await db_1.default.query(query, [userId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching friend activity:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /follows/suggestions - Get suggested users to follow (users not currently followed)
router.get("/suggestions", async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "X-User-Id header is required" });
            return;
        }
        const query = `
      SELECT
        u.id,
        u.username,
        u.email,
        u.first_name,
        u.last_name,
        COUNT(DISTINCT p.id) as post_count,
        COUNT(DISTINCT f.follower_id) as follower_count
      FROM users u
      LEFT JOIN posts p ON u.id = p.author_id
      LEFT JOIN follows f ON u.id = f.following_id
      WHERE u.id != $1
        AND u.id NOT IN (
          SELECT following_id
          FROM follows
          WHERE follower_id = $1
        )
      GROUP BY u.id, u.username, u.email, u.first_name, u.last_name
      ORDER BY post_count DESC, follower_count DESC
      LIMIT 20
    `;
        const result = await db_1.default.query(query, [userId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching suggestions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// GET /follows/check/:userId - Check if current user is following a specific user
router.get("/check/:userId", async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "X-User-Id header is required" });
            return;
        }
        const targetUserId = req.params.userId;
        const query = `
      SELECT EXISTS(
        SELECT 1 FROM follows
        WHERE follower_id = $1 AND following_id = $2
      ) as is_following
    `;
        const result = await db_1.default.query(query, [userId, targetUserId]);
        res.json({ is_following: result.rows[0].is_following });
    }
    catch (error) {
        console.error("Error checking follow status:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /follows/:userId - Follow a user
router.post("/:userId", async (req, res) => {
    const client = await db_1.default.connect();
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "X-User-Id header is required" });
            return;
        }
        const targetUserId = req.params.userId;
        // Validate cannot follow yourself
        if (userId === targetUserId) {
            res.status(400).json({ error: "Cannot follow yourself" });
            return;
        }
        // Validate target user exists
        const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [targetUserId]);
        if (userCheck.rows.length === 0) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        // Check if already following
        const existingFollow = await client.query("SELECT id FROM follows WHERE follower_id = $1 AND following_id = $2", [userId, targetUserId]);
        if (existingFollow.rows.length > 0) {
            res.status(400).json({ error: "Already following this user" });
            return;
        }
        // Create follow relationship
        await client.query("INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)", [userId, targetUserId]);
        res.status(201).json({ message: "Successfully followed user" });
    }
    catch (error) {
        console.error("Error following user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
});
// DELETE /follows/:userId - Unfollow a user
router.delete("/:userId", async (req, res) => {
    const client = await db_1.default.connect();
    try {
        const userId = req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "X-User-Id header is required" });
            return;
        }
        const targetUserId = req.params.userId;
        // Delete follow relationship
        const result = await client.query("DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING id", [userId, targetUserId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: "Not following this user" });
            return;
        }
        res.json({ message: "Successfully unfollowed user" });
    }
    catch (error) {
        console.error("Error unfollowing user:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
});
exports.default = router;
