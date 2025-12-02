"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const cbordService_1 = __importDefault(require("../services/cbordService"));
const router = (0, express_1.Router)();
// GET /search - Search for dining halls, users, and dishes
router.get("/", async (req, res) => {
    try {
        const query = (req.query.q || "").trim().toLowerCase();
        if (!query || query.length < 2) {
            res.status(400).json({ error: "Query must be at least 2 characters" });
            return;
        }
        const [users, diningHalls] = await Promise.all([
            searchUsers(query),
            searchDiningHalls(query),
        ]);
        res.json({
            users,
            diningHalls,
            query,
        });
    }
    catch (error) {
        console.error("Error searching:", error);
        res.status(500).json({ error: "Failed to search" });
    }
});
// GET /search/users - Search for users
router.get("/users", async (req, res) => {
    try {
        const query = (req.query.q || "").trim().toLowerCase();
        if (!query || query.length < 2) {
            res.status(400).json({ error: "Query must be at least 2 characters" });
            return;
        }
        const users = await searchUsers(query);
        res.json({ users, query });
    }
    catch (error) {
        console.error("Error searching users:", error);
        res.status(500).json({ error: "Failed to search users" });
    }
});
// GET /search/dining-halls - Search for dining halls
router.get("/dining-halls", async (req, res) => {
    try {
        const query = (req.query.q || "").trim().toLowerCase();
        if (!query || query.length < 2) {
            res.status(400).json({ error: "Query must be at least 2 characters" });
            return;
        }
        const diningHalls = await searchDiningHalls(query);
        res.json({ diningHalls, query });
    }
    catch (error) {
        console.error("Error searching dining halls:", error);
        res.status(500).json({ error: "Failed to search dining halls" });
    }
});
// GET /search/dishes - Search for dishes
router.get("/dishes", async (req, res) => {
    try {
        const query = (req.query.q || "").trim().toLowerCase();
        if (!query || query.length < 2) {
            res.status(400).json({ error: "Query must be at least 2 characters" });
            return;
        }
        // Search through posts for menu items
        const dishes = await searchDishes(query);
        res.json({ dishes, query });
    }
    catch (error) {
        console.error("Error searching dishes:", error);
        res.status(500).json({ error: "Failed to search dishes" });
    }
});
// GET /search/trending-dishes - Get top trending dishes
router.get("/trending-dishes", async (req, res) => {
    try {
        const limit = Math.min(Number(req.query.limit) || 20, 100); // Max 100
        const dishes = await getTrendingDishes(limit);
        res.json({ dishes });
    }
    catch (error) {
        console.error("Error fetching trending dishes:", error);
        res.status(500).json({ error: "Failed to fetch trending dishes" });
    }
});
// Helper functions
async function searchUsers(query) {
    try {
        const result = await db_1.default.query(`SELECT id, username, email, first_name, last_name, created_at
       FROM users
       WHERE LOWER(username) LIKE $1 
          OR LOWER(first_name) LIKE $1 
          OR LOWER(last_name) LIKE $1
          OR LOWER(email) LIKE $1
       LIMIT 20`, [`%${query}%`]);
        return result.rows;
    }
    catch (error) {
        console.error("Error in searchUsers:", error);
        return [];
    }
}
async function searchDiningHalls(query) {
    try {
        // First try to get from our database
        const result = await db_1.default.query(`SELECT id, name, cbordUnitId
       FROM dining_halls
       WHERE LOWER(name) LIKE $1
       LIMIT 10`, [`%${query}%`]);
        if (result.rows.length > 0) {
            return result.rows;
        }
        // If not found in DB, get all halls and filter by name
        const allHalls = await cbordService_1.default.getDiningHalls();
        return allHalls
            .filter((hall) => hall.name.toLowerCase().includes(query))
            .slice(0, 10);
    }
    catch (error) {
        console.error("Error in searchDiningHalls:", error);
        return [];
    }
}
async function searchDishes(query) {
    try {
        // Search for menu items from both posts and photo dish names
        const result = await db_1.default.query(`SELECT 
         dish_name,
         COUNT(*) as frequency
       FROM (
         -- Get dishes from menu_items array
         SELECT unnest(menu_items) as dish_name 
         FROM posts 
         WHERE menu_items IS NOT NULL
         
         UNION ALL
         
         -- Get dishes from photo dish_names
         SELECT dish_name 
         FROM post_photos 
         WHERE dish_name IS NOT NULL AND dish_name != ''
       ) AS all_dishes
       WHERE LOWER(dish_name) LIKE $1
       GROUP BY dish_name
       ORDER BY frequency DESC
       LIMIT 20`, [`%${query}%`]);
        // Transform to return the dish names with frequency
        return result.rows.map((row) => ({
            name: row.dish_name,
            frequency: parseInt(row.frequency),
        }));
    }
    catch (error) {
        console.error("Error in searchDishes:", error);
        return [];
    }
}
async function getTrendingDishes(limit) {
    try {
        // Get top dishes by frequency from both menu_items and photo dish_names
        const result = await db_1.default.query(`SELECT 
         dish_name,
         COUNT(*) as frequency
       FROM (
         -- Get dishes from menu_items array
         SELECT unnest(menu_items) as dish_name 
         FROM posts 
         WHERE menu_items IS NOT NULL
         
         UNION ALL
         
         -- Get dishes from photo dish_names
         SELECT dish_name 
         FROM post_photos 
         WHERE dish_name IS NOT NULL AND dish_name != ''
       ) AS all_dishes
       GROUP BY dish_name
       ORDER BY frequency DESC
       LIMIT $1`, [limit]);
        // Transform to return the dish names with frequency
        return result.rows.map((row) => ({
            name: row.dish_name,
            frequency: parseInt(row.frequency),
        }));
    }
    catch (error) {
        console.error("Error in getTrendingDishes:", error);
        return [];
    }
}
exports.default = router;
