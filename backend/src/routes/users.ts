import { Request, Response, Router } from 'express';
import pool from '../db';
import { requireAuth } from '../middleware/auth';
import { CreateUserRequest, User } from '../types';

const router = Router();

// GET /users/me - return current authenticated user's profile
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    // user id may be attached by middleware to req.userId or present in header
    const userId = (req as any).userId || (req.headers as any)['x-user-id'];
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, email_verified, created_at FROM users WHERE id = $1 LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/username/:username - Get user by username
router.get('/username/:username', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username } = req.params;

    const result = await pool.query<User>(
      'SELECT * FROM users WHERE username = $1 LIMIT 1',
      [username]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /users/:id - Get user by ID (public, no auth required)
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    console.log(`[Users] Fetching user by ID: ${id}`);

    // Select only columns that exist in the database
    const result = await pool.query(
      'SELECT id, username, email, first_name, last_name, email_verified, created_at FROM users WHERE id = $1 LIMIT 1',
      [id]
    );

    if (result.rows.length === 0) {
      console.log(`[Users] User not found: ${id}`);
      res.status(404).json({ error: 'User not found' });
      return;
    }

    console.log(`[Users] User found: ${id}`);
    res.status(200).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching user:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// POST /users - Create a new user (for testing only)
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email }: CreateUserRequest = req.body;

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
    const result = await pool.query<User>(
      `INSERT INTO users (username, email)
       VALUES ($1, $2)
       RETURNING *`,
      [username.trim(), email.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
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
router.patch('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId || (req.headers as any)['x-user-id'];
    if (!userId) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Acceptable fields to update
    const allowedFields = [
      'first_name', 'last_name', 'username', 'bio', 'gender', 'birthday', 'email', 'phone',
      'notification_pref', 'language', 'timezone', 'privacy', 'theme', 'profile_photo'
    ];

    const updates: Record<string, any> = {};
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
    const result = await pool.query<User>(query, values as any[]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
