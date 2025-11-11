"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../db"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET /users/me - return current authenticated user's profile
router.get('/me', auth_1.requireAuth, async (req, res) => {
    try {
        // user id may be attached by middleware to req.userId or present in header
        const userId = req.userId || req.headers['x-user-id'];
        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const result = await db_1.default.query(`SELECT id, username, email, first_name, last_name, email_verified, created_at FROM users WHERE id = $1 LIMIT 1`, [userId]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// GET /users/username/:username - Get user by username
router.get('/username/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const result = await db_1.default.query('SELECT * FROM users WHERE username = $1 LIMIT 1', [username]);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /users - Create a new user (for testing only)
router.post('/', async (req, res) => {
    try {
        const { username, email } = req.body;
        // Validation
        if (!username || typeof username !== 'string' || username.trim().length === 0) {
            res.status(400).json({ error: 'username is required and must be a non-empty string' });
            return;
        }
        if (!email || typeof email !== 'string' || !email.includes('@')) {
            res.status(400).json({ error: 'email is required and must be valid' });
            return;
        }
        if (username.length > 50) {
            res.status(400).json({ error: 'username must be 50 characters or less' });
            return;
        }
        if (email.length > 255) {
            res.status(400).json({ error: 'email must be 255 characters or less' });
            return;
        }
        // Insert user
        const result = await db_1.default.query(`INSERT INTO users (username, email)
       VALUES ($1, $2)
       RETURNING *`, [username.trim(), email.trim()]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        // Handle unique constraint violations
        if (error.code === '23505') {
            if (error.constraint === 'users_username_key') {
                res.status(409).json({ error: 'username already exists' });
                return;
            }
            if (error.constraint === 'users_email_key') {
                res.status(409).json({ error: 'email already exists' });
                return;
            }
        }
        console.error('Error creating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PATCH /users/me - update current authenticated user's profile
router.patch('/me', auth_1.requireAuth, async (req, res) => {
    try {
        const userId = req.userId || req.headers['x-user-id'];
        if (!userId) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        // Acceptable fields to update
        const allowedFields = [
            'first_name', 'last_name', 'username', 'bio', 'gender', 'birthday', 'email', 'phone',
            'notification_pref', 'language', 'timezone', 'privacy', 'theme', 'profile_photo'
        ];
        const updates = {};
        for (const field of allowedFields) {
            if (field in req.body) {
                updates[field] = req.body[field];
            }
        }
        if (Object.keys(updates).length === 0) {
            res.status(400).json({ error: 'No valid fields to update' });
            return;
        }
        // Build SET clause and values
        const setClauses = Object.keys(updates).map((field, i) => `${field} = $${i + 1}`);
        const values = Object.values(updates);
        values.push(userId); // For WHERE clause
        const query = `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
        const result = await db_1.default.query(query, values);
        if (result.rows.length === 0) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.status(200).json(result.rows[0]);
    }
    catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
