import { Request, Response, Router } from 'express';
import pool from '../db';
import { CreateUserRequest, User } from '../types';

const router = Router();

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

export default router;
