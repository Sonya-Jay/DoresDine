"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const router = (0, express_1.Router)();
// GET /posts - Fetch all posts with photos and user info
router.get("/", async (req, res) => {
    try {
        const userId = req.headers["x-user-id"];
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
      GROUP BY p.id, p.author_id, p.caption, p.rating, p.menu_items, p.dining_hall_name, p.meal_type, p.created_at, u.username, u.email, l.like_count, c.comment_count, ul.user_id
      ORDER BY p.created_at DESC
    `;
        const result = await db_1.default.query(query, [userId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching posts:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /posts - Create a new post with optional photos
router.post("/", async (req, res) => {
    const client = await db_1.default.connect();
    try {
        // Auth stub: Require X-User-Id header
        const userId = req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "X-User-Id header is required" });
            return;
        }
        // Validate user exists
        const userCheck = await client.query("SELECT id FROM users WHERE id = $1", [
            userId,
        ]);
        if (userCheck.rows.length === 0) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        const { caption, rating, menu_items, dining_hall_name, meal_type, photos, } = req.body;
        // Validation
        if (caption !== undefined && caption !== null) {
            if (typeof caption !== "string") {
                res.status(400).json({ error: "caption must be a string" });
                return;
            }
            if (caption.length > 5000) {
                res
                    .status(400)
                    .json({ error: "caption must be 5000 characters or less" });
                return;
            }
        }
        if (photos !== undefined && photos !== null) {
            if (!Array.isArray(photos)) {
                res.status(400).json({ error: "photos must be an array" });
                return;
            }
            if (photos.length > 10) {
                res.status(400).json({ error: "maximum 10 photos per post" });
                return;
            }
            // Validate each photo
            for (const [index, photo] of photos.entries()) {
                if (!photo.storage_key ||
                    typeof photo.storage_key !== "string" ||
                    photo.storage_key.trim().length === 0) {
                    res.status(400).json({
                        error: `photo[${index}].storage_key is required and must be a non-empty string`,
                    });
                    return;
                }
                if (photo.storage_key.length > 500) {
                    res.status(400).json({
                        error: `photo[${index}].storage_key must be 500 characters or less`,
                    });
                    return;
                }
                if (photo.display_order !== undefined &&
                    (typeof photo.display_order !== "number" || photo.display_order < 0)) {
                    res.status(400).json({
                        error: `photo[${index}].display_order must be a non-negative number`,
                    });
                    return;
                }
            }
        }
        if (menu_items !== undefined && menu_items !== null) {
            if (!Array.isArray(menu_items)) {
                res.status(400).json({ error: "menu_items must be an array" });
                return;
            }
            if (menu_items.length > 20) {
                res.status(400).json({ error: "maximum 20 menu items per post" });
                return;
            }
            // Validate each menu item
            for (const [index, item] of menu_items.entries()) {
                if (!item || typeof item !== "string" || item.trim().length === 0) {
                    res
                        .status(400)
                        .json({ error: `menu_items[${index}] must be a non-empty string` });
                    return;
                }
                if (item.length > 200) {
                    res.status(400).json({
                        error: `menu_items[${index}] must be 200 characters or less`,
                    });
                    return;
                }
            }
        }
        // Begin transaction
        await client.query("BEGIN");
        // Insert post
        const postResult = await client.query(`INSERT INTO posts (author_id, caption, rating, menu_items, dining_hall_name, meal_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`, [
            userId,
            caption || null,
            rating || null,
            menu_items || null,
            dining_hall_name || null,
            meal_type || null,
        ]);
        const post = postResult.rows[0];
        const photoRecords = [];
        // Insert photos if provided
        if (photos && photos.length > 0) {
            for (const photo of photos) {
                const photoResult = await client.query(`INSERT INTO post_photos (post_id, storage_key, display_order)
           VALUES ($1, $2, $3)
           RETURNING *`, [post.id, photo.storage_key.trim(), photo.display_order || 0]);
                photoRecords.push(photoResult.rows[0]);
            }
        }
        // Commit transaction
        await client.query("COMMIT");
        // Return post with photos
        const response = {
            ...post,
            photos: photoRecords,
        };
        res.status(201).json(response);
    }
    catch (error) {
        await client.query("ROLLBACK");
        console.error("Error creating post:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
});
// POST /posts/:id/like - Toggle like on a post
router.post("/:id/like", async (req, res) => {
    const client = await db_1.default.connect();
    try {
        // Auth stub: Require X-User-Id header
        const userId = req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "X-User-Id header is required" });
            return;
        }
        const postId = req.params.id;
        // Validate post exists
        const postCheck = await client.query("SELECT id FROM posts WHERE id = $1", [
            postId,
        ]);
        if (postCheck.rows.length === 0) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        // Check if user already liked this post
        const existingLike = await client.query("SELECT id FROM likes WHERE post_id = $1 AND user_id = $2", [postId, userId]);
        if (existingLike.rows.length > 0) {
            // Unlike: Remove the like
            await client.query("DELETE FROM likes WHERE post_id = $1 AND user_id = $2", [postId, userId]);
            res.json({ liked: false, message: "Post unliked" });
        }
        else {
            // Like: Add the like
            await client.query("INSERT INTO likes (post_id, user_id) VALUES ($1, $2)", [postId, userId]);
            res.json({ liked: true, message: "Post liked" });
        }
    }
    catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
});
// GET /posts/:id/comments - Get comments for a post
router.get("/:id/comments", async (req, res) => {
    try {
        const postId = req.params.id;
        const query = `
      SELECT 
        c.id,
        c.text,
        c.created_at,
        u.username,
        u.email
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at ASC
    `;
        const result = await db_1.default.query(query, [postId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error("Error fetching comments:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// POST /posts/:id/comments - Add comment to a post
router.post("/:id/comments", async (req, res) => {
    const client = await db_1.default.connect();
    try {
        // Auth stub: Require X-User-Id header
        const userId = req.headers["x-user-id"];
        if (!userId) {
            res.status(401).json({ error: "X-User-Id header is required" });
            return;
        }
        const postId = req.params.id;
        const { text } = req.body;
        // Validation
        if (!text || typeof text !== "string" || text.trim().length === 0) {
            res.status(400).json({ error: "Comment text is required" });
            return;
        }
        if (text.length > 1000) {
            res
                .status(400)
                .json({ error: "Comment must be 1000 characters or less" });
            return;
        }
        // Validate post exists
        const postCheck = await client.query("SELECT id FROM posts WHERE id = $1", [postId]);
        if (postCheck.rows.length === 0) {
            res.status(404).json({ error: "Post not found" });
            return;
        }
        // Insert comment
        const commentResult = await client.query(`INSERT INTO comments (post_id, author_id, text)
       VALUES ($1, $2, $3)
       RETURNING *`, [postId, userId, text.trim()]);
        // Get comment with user info
        const query = `
      SELECT 
        c.id,
        c.text,
        c.created_at,
        u.username,
        u.email
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.id = $1
    `;
        const result = await db_1.default.query(query, [commentResult.rows[0].id]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error("Error creating comment:", error);
        res.status(500).json({ error: "Internal server error" });
    }
    finally {
        client.release();
    }
});
exports.default = router;
