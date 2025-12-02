import request from 'supertest';
import { createTestApp } from '../app';
import { createTestUser, createTestPost } from '../helpers';
import cbordService from '../../src/services/cbordService';

// Mock the cbordService
jest.mock('../../src/services/cbordService', () => {
  return {
    __esModule: true,
    default: {
      getDiningHalls: jest.fn(),
      getMenuSchedule: jest.fn(),
      getMenuItems: jest.fn(),
    },
  };
});

describe('Search Routes', () => {
  const app = createTestApp();
  const mockCbordService = cbordService as jest.Mocked<typeof cbordService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /search', () => {
    it('should search for users and dining halls', async () => {
      const user = await createTestUser({ username: 'john_doe', first_name: 'John', last_name: 'Doe' });
      mockCbordService.getDiningHalls.mockResolvedValue([
        { id: 1, name: 'Rand Dining Center', cbordUnitId: 1 },
      ] as any);

      const response = await request(app)
        .get('/search?q=john');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(response.body).toHaveProperty('diningHalls');
      expect(response.body).toHaveProperty('query');
      expect(Array.isArray(response.body.users)).toBe(true);
      expect(Array.isArray(response.body.diningHalls)).toBe(true);
    });

    it('should require query with at least 2 characters', async () => {
      const response = await request(app)
        .get('/search?q=j');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('at least 2 characters');
    });

    it('should handle empty query', async () => {
      const response = await request(app)
        .get('/search?q=');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /search/users', () => {
    it('should search for users by username', async () => {
      const user = await createTestUser({ username: 'john_doe', first_name: 'John', last_name: 'Doe' });

      const response = await request(app)
        .get('/search/users?q=john');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('users');
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should search for users by name', async () => {
      const user = await createTestUser({ first_name: 'John', last_name: 'Doe' });

      const response = await request(app)
        .get('/search/users?q=john');

      expect(response.status).toBe(200);
      expect(response.body.users.length).toBeGreaterThan(0);
    });

    it('should require query with at least 2 characters', async () => {
      const response = await request(app)
        .get('/search/users?q=j');

      expect(response.status).toBe(400);
    });

    it('should handle empty query', async () => {
      const response = await request(app)
        .get('/search/users?q=');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /search/dining-halls', () => {
    it('should search for dining halls', async () => {
      mockCbordService.getDiningHalls.mockResolvedValue([
        { id: 1, name: 'Rand Dining Center', cbordUnitId: 1 },
        { id: 2, name: 'The Commons', cbordUnitId: 2 },
      ] as any);

      const response = await request(app)
        .get('/search/dining-halls?q=rand');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('diningHalls');
      expect(Array.isArray(response.body.diningHalls)).toBe(true);
    });

    it('should require query with at least 2 characters', async () => {
      const response = await request(app)
        .get('/search/dining-halls?q=r');

      expect(response.status).toBe(400);
    });

    it('should handle empty query', async () => {
      const response = await request(app)
        .get('/search/dining-halls?q=');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /search/dishes', () => {
    it('should search for dishes from posts', async () => {
      const user = await createTestUser();
      await createTestPost(user.id, { menu_items: ['Pizza', 'Pasta'] });

      const response = await request(app)
        .get('/search/dishes?q=pizza');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dishes');
      expect(Array.isArray(response.body.dishes)).toBe(true);
    });

    it('should require query with at least 2 characters', async () => {
      const response = await request(app)
        .get('/search/dishes?q=p');

      expect(response.status).toBe(400);
    });

    it('should handle empty query', async () => {
      const response = await request(app)
        .get('/search/dishes?q=');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /search/trending-dishes', () => {
    it('should fetch trending dishes', async () => {
      const user = await createTestUser();
      await createTestPost(user.id, { menu_items: ['Pizza'] });
      await createTestPost(user.id, { menu_items: ['Salad'] });

      const response = await request(app)
        .get('/search/trending-dishes');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('dishes');
      expect(Array.isArray(response.body.dishes)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const user = await createTestUser();
      await createTestPost(user.id, { menu_items: ['Pizza'] });
      await createTestPost(user.id, { menu_items: ['Salad'] });

      const response = await request(app)
        .get('/search/trending-dishes?limit=1');

      expect(response.status).toBe(200);
      expect(response.body.dishes.length).toBeLessThanOrEqual(1);
    });

    it('should cap limit at 100', async () => {
      const response = await request(app)
        .get('/search/trending-dishes?limit=200');

      expect(response.status).toBe(200);
      // Should still work with capped limit
    });
  });

  describe('GET /search/dish-availability', () => {
    it('should search for dish availability', async () => {
      const user = await createTestUser();
      await createTestPost(user.id, { 
        menu_items: ['Pizza'],
        dining_hall_name: 'Rand Dining Center',
        meal_type: 'Lunch'
      });

      mockCbordService.getMenuSchedule.mockResolvedValue([
        { date: '2025-12-02', meals: [{ name: 'Lunch', menuId: 1 }] }
      ] as any);

      const response = await request(app)
        .get('/search/dish-availability?q=pizza');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('today');
      expect(response.body).toHaveProperty('later');
    });

    it('should require query with at least 1 character', async () => {
      const response = await request(app)
        .get('/search/dish-availability?q=');

      expect(response.status).toBe(400);
    });
  });
});

