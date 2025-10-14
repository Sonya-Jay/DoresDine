import { Request, Response, Router } from 'express';
import pool from '../db';
import { CreatePostRequest, Post, PostPhoto, PostWithPhotos } from '../types';

const router = Router();

// POST /posts - Create a new post with optional photos
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const client = await pool.connect();

  try {
    // Auth stub: Require X-User-Id header
    const userId = req.headers['x-user-id'] as string;
    if (!userId) {
      res.status(401).json({ error: 'X-User-Id header is required' });
      return;
    }

    // Validate user exists
    const userCheck = await client.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const { caption, photos }: CreatePostRequest = req.body;

    // Validation
    if (caption !== undefined && caption !== null) {
      if (typeof caption !== 'string') {
        res.status(400).json({ error: 'caption must be a string' });
        return;
      }
      if (caption.length > 5000) {
        res.status(400).json({ error: 'caption must be 5000 characters or less' });
        return;
      }
    }

    if (photos !== undefined && photos !== null) {
      if (!Array.isArray(photos)) {
        res.status(400).json({ error: 'photos must be an array' });
        return;
      }

      if (photos.length > 10) {
        res.status(400).json({ error: 'maximum 10 photos per post' });
        return;
      }

      // Validate each photo
      for (const [index, photo] of photos.entries()) {
        if (!photo.storage_key || typeof photo.storage_key !== 'string' || photo.storage_key.trim().length === 0) {
          res.status(400).json({ error: `photo[${index}].storage_key is required and must be a non-empty string` });
          return;
        }

        if (photo.storage_key.length > 500) {
          res.status(400).json({ error: `photo[${index}].storage_key must be 500 characters or less` });
          return;
        }

        if (photo.display_order !== undefined && (typeof photo.display_order !== 'number' || photo.display_order < 0)) {
          res.status(400).json({ error: `photo[${index}].display_order must be a non-negative number` });
          return;
        }
      }
    }

    // Begin transaction
    await client.query('BEGIN');

    // Insert post
    const postResult = await client.query<Post>(
      `INSERT INTO posts (author_id, caption)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, caption || null]
    );

    const post = postResult.rows[0];
    const photoRecords: PostPhoto[] = [];

    // Insert photos if provided
    if (photos && photos.length > 0) {
      for (const photo of photos) {
        const photoResult = await client.query<PostPhoto>(
          `INSERT INTO post_photos (post_id, storage_key, display_order)
           VALUES ($1, $2, $3)
           RETURNING *`,
          [post.id, photo.storage_key.trim(), photo.display_order || 0]
        );
        photoRecords.push(photoResult.rows[0]);
      }
    }

    // Commit transaction
    await client.query('COMMIT');

    // Return post with photos
    const response: PostWithPhotos = {
      ...post,
      photos: photoRecords,
    };

    res.status(201).json(response);
  } catch (error: any) {
    await client.query('ROLLBACK');
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

export default router;
