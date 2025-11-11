import request from 'supertest';
import { createTestApp } from '../app';
import { createTestUser, createTestPost, createTestLike, createTestComment, getAuthHeaders } from '../helpers';
import { getTestPool } from '../setup';

describe('Posts Routes', () => {
  const app = createTestApp();
  const pool = getTestPool();

  describe('GET /posts', () => {
    it('should fetch all posts', async () => {
      const user = await createTestUser();
      const { id: postId } = await createTestPost(user.id);

      const response = await request(app)
        .get('/posts')
        .set('x-user-id', user.id);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('username');
    });

    it('should return empty array when no posts', async () => {
      const response = await request(app)
        .get('/posts');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should include photos in posts', async () => {
      const user = await createTestUser();
      const { id: postId } = await createTestPost(user.id, {
        photos: ['photo1.jpg', 'photo2.jpg'],
      });

      const response = await request(app)
        .get('/posts')
        .set('x-user-id', user.id);

      expect(response.status).toBe(200);
      const post = response.body.find((p: any) => p.id === postId);
      expect(post).toBeDefined();
      expect(Array.isArray(post.photos)).toBe(true);
      expect(post.photos.length).toBe(2);
    });

    it('should include like and comment counts', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const { id: postId } = await createTestPost(user1.id);
      
      await createTestLike(postId, user2.id);
      await createTestComment(postId, user2.id, 'Test comment');

      const response = await request(app)
        .get('/posts')
        .set('x-user-id', user1.id);

      expect(response.status).toBe(200);
      const post = response.body.find((p: any) => p.id === postId);
      expect(post.like_count).toBe(1);
      expect(post.comment_count).toBe(1);
    });

    it('should indicate if user liked a post', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const { id: postId } = await createTestPost(user1.id);
      
      await createTestLike(postId, user2.id);

      const response = await request(app)
        .get('/posts')
        .set('x-user-id', user2.id);

      expect(response.status).toBe(200);
      const post = response.body.find((p: any) => p.id === postId);
      expect(post.is_liked).toBe(true);
    });
  });

  describe('GET /posts/me', () => {
    it('should fetch current user posts', async () => {
      const user = await createTestUser();
      const { id: postId } = await createTestPost(user.id);

      const response = await request(app)
        .get('/posts/me')
        .set(getAuthHeaders(user.id));

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].id).toBe(postId);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .get('/posts/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Authentication required');
    });

    it('should only return posts from authenticated user', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      await createTestPost(user1.id);
      await createTestPost(user2.id);

      const response = await request(app)
        .get('/posts/me')
        .set(getAuthHeaders(user1.id));

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].author_id).toBe(user1.id);
    });
  });

  describe('POST /posts', () => {
    it('should create a new post', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          rating: 8.5,
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.caption).toBe('Test post');
      expect(response.body.rating).toBe(8.5);
    });

    it('should create post with photos', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post with photos',
          photos: [
            { storage_key: 'photo1.jpg', display_order: 0 },
            { storage_key: 'photo2.jpg', display_order: 1 },
          ],
        });

      expect(response.status).toBe(201);
      expect(response.body.photos.length).toBe(2);
    });

    it('should create post with menu items', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          menu_items: ['Pizza', 'Salad'],
        });

      expect(response.status).toBe(201);
      expect(response.body.menu_items).toEqual(['Pizza', 'Salad']);
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/posts')
        .send({
          caption: 'Test post',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('X-User-Id');
    });

    it('should reject post with invalid rating type', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          rating: 'not a number',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('rating must be a number');
    });

    it('should reject post with rating below 1.0', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          rating: 0.5,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('rating must be between 1.0 and 10.0');
    });

    it('should reject post with rating above 10.0', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          rating: 11.0,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('rating must be between 1.0 and 10.0');
    });

    it('should reject caption that is not a string', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 123,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('caption must be a string');
    });

    it('should reject caption longer than 5000 characters', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'a'.repeat(5001),
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('caption must be 5000 characters or less');
    });

    it('should reject photos that are not an array', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          photos: 'not an array',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Photos must be an array');
    });

    it('should reject more than 10 photos', async () => {
      const user = await createTestUser();
      const photos = Array.from({ length: 11 }, (_, i) => ({
        storage_key: `photo${i}.jpg`,
        display_order: i,
      }));
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          photos,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('max 10 photos');
    });

    it('should reject photo without storage_key', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          photos: [{ display_order: 0 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('storage_key');
    });

    it('should reject photo with storage_key longer than 500 characters', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          photos: [{ storage_key: 'a'.repeat(501), display_order: 0 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('storage_key');
    });

    it('should reject photo with negative display_order', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          photos: [{ storage_key: 'photo.jpg', display_order: -1 }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('display_order');
    });

    it('should reject menu_items that are not an array', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          menu_items: 'not an array',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Menu items must be an array');
    });

    it('should reject too many menu items', async () => {
      const user = await createTestUser();
      const menu_items = Array.from({ length: 21 }, (_, i) => `Item ${i}`);
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          menu_items,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('20 items');
    });

    it('should reject empty menu item', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          menu_items: [''],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('non-empty string');
    });

    it('should reject menu item longer than 200 characters', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          menu_items: ['a'.repeat(201)],
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('200 characters');
    });

    it('should round rating to 1 decimal place', async () => {
      const user = await createTestUser();
      const response = await request(app)
        .post('/posts')
        .set('x-user-id', user.id)
        .send({
          caption: 'Test post',
          rating: 8.567,
        });

      expect(response.status).toBe(201);
      expect(response.body.rating).toBe(8.6);
    });

    it('should reject post for non-existent user', async () => {
      const fakeUserId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .post('/posts')
        .set('x-user-id', fakeUserId)
        .send({
          caption: 'Test post',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('POST /posts/:id/like', () => {
    it('should like a post', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const { id: postId } = await createTestPost(user1.id);

      const response = await request(app)
        .post(`/posts/${postId}/like`)
        .set('x-user-id', user2.id);

      expect(response.status).toBe(200);
      expect(response.body.liked).toBe(true);
      expect(response.body.message).toContain('liked');
    });

    it('should unlike a post if already liked', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const { id: postId } = await createTestPost(user1.id);
      
      await createTestLike(postId, user2.id);

      const response = await request(app)
        .post(`/posts/${postId}/like`)
        .set('x-user-id', user2.id);

      expect(response.status).toBe(200);
      expect(response.body.liked).toBe(false);
      expect(response.body.message).toContain('unliked');
    });

    it('should require authentication', async () => {
      const user = await createTestUser();
      const { id: postId } = await createTestPost(user.id);

      const response = await request(app)
        .post(`/posts/${postId}/like`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('X-User-Id');
    });

    it('should return 404 for non-existent post', async () => {
      const user = await createTestUser();
      const fakePostId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .post(`/posts/${fakePostId}/like`)
        .set('x-user-id', user.id);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });

  describe('GET /posts/:id/comments', () => {
    it('should fetch comments for a post', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const { id: postId } = await createTestPost(user1.id);
      
      await createTestComment(postId, user2.id, 'Test comment');

      const response = await request(app)
        .get(`/posts/${postId}/comments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].text).toBe('Test comment');
      expect(response.body[0]).toHaveProperty('username');
    });

    it('should return empty array for post with no comments', async () => {
      const user = await createTestUser();
      const { id: postId } = await createTestPost(user.id);

      const response = await request(app)
        .get(`/posts/${postId}/comments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });
  });

  describe('POST /posts/:id/comments', () => {
    it('should add a comment to a post', async () => {
      const user1 = await createTestUser();
      const user2 = await createTestUser();
      const { id: postId } = await createTestPost(user1.id);

      const response = await request(app)
        .post(`/posts/${postId}/comments`)
        .set('x-user-id', user2.id)
        .send({ text: 'Test comment' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.text).toBe('Test comment');
      expect(response.body).toHaveProperty('username');
    });

    it('should require authentication', async () => {
      const user = await createTestUser();
      const { id: postId } = await createTestPost(user.id);

      const response = await request(app)
        .post(`/posts/${postId}/comments`)
        .send({ text: 'Test comment' });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('X-User-Id');
    });

    it('should require text field', async () => {
      const user = await createTestUser();
      const { id: postId } = await createTestPost(user.id);

      const response = await request(app)
        .post(`/posts/${postId}/comments`)
        .set('x-user-id', user.id)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Comment text is required');
    });

    it('should reject empty text', async () => {
      const user = await createTestUser();
      const { id: postId } = await createTestPost(user.id);

      const response = await request(app)
        .post(`/posts/${postId}/comments`)
        .set('x-user-id', user.id)
        .send({ text: '   ' });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Comment text is required');
    });

    it('should reject comment longer than 1000 characters', async () => {
      const user = await createTestUser();
      const { id: postId } = await createTestPost(user.id);

      const response = await request(app)
        .post(`/posts/${postId}/comments`)
        .set('x-user-id', user.id)
        .send({ text: 'a'.repeat(1001) });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('1000 characters');
    });

    it('should reject comment on non-existent post', async () => {
      const user = await createTestUser();
      const fakePostId = '00000000-0000-0000-0000-000000000000';

      const response = await request(app)
        .post(`/posts/${fakePostId}/comments`)
        .set('x-user-id', user.id)
        .send({ text: 'Test comment' });

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });
  });
});

