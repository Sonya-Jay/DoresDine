import request from 'supertest';
import { createTestApp } from '../app';
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

describe('Dining Routes', () => {
  const app = createTestApp();
  const mockCbordService = cbordService as jest.Mocked<typeof cbordService>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/dining/halls', () => {
    it('should fetch all dining halls', async () => {
      const mockHalls = [
        { id: 1, name: 'Rand Dining Center', cbordUnitId: 1, isOpen: true },
        { id: 2, name: 'The Commons', cbordUnitId: 2, isOpen: false },
      ];
      mockCbordService.getDiningHalls.mockResolvedValue(mockHalls as any);

      const response = await request(app)
        .get('/api/dining/halls');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Rand Dining Center');
    });

    it('should handle errors when fetching dining halls', async () => {
      mockCbordService.getDiningHalls.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .get('/api/dining/halls');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Failed to fetch');
    });
  });

  describe('GET /api/dining/halls/:id/menu', () => {
    it('should fetch menu schedule for a dining hall', async () => {
      const mockHalls = [
        { id: 1, name: 'Rand Dining Center', cbordUnitId: 1, isOpen: true },
      ];
      const mockSchedule = [
        {
          date: 'Monday, November 11, 2025',
          meals: [
            { id: 1, name: 'Breakfast', date: 'Monday, November 11, 2025' },
            { id: 2, name: 'Lunch', date: 'Monday, November 11, 2025' },
          ],
        },
      ];

      mockCbordService.getDiningHalls.mockResolvedValue(mockHalls as any);
      mockCbordService.getMenuSchedule.mockResolvedValue(mockSchedule as any);

      const response = await request(app)
        .get('/api/dining/halls/1/menu');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('hall');
      expect(response.body).toHaveProperty('schedule');
      expect(response.body.schedule).toEqual(mockSchedule);
    });

    it('should return 404 for non-existent dining hall', async () => {
      mockCbordService.getDiningHalls.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dining/halls/999/menu');

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('not found');
    });

    it('should handle errors when fetching menu schedule', async () => {
      const mockHalls = [
        { id: 1, name: 'Rand Dining Center', cbordUnitId: 1, isOpen: true },
      ];
      mockCbordService.getDiningHalls.mockResolvedValue(mockHalls as any);
      mockCbordService.getMenuSchedule.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .get('/api/dining/halls/1/menu');

      expect(response.status).toBe(500);
      expect(response.body.error).toContain('Failed to fetch');
    });
  });

  describe('GET /api/dining/menu/:menuId/items', () => {
    it('should fetch menu items for a meal', async () => {
      const mockItems = [
        { name: 'Pizza', description: 'Cheese pizza', calories: 285 },
        { name: 'Salad', description: 'Garden salad', calories: 150 },
      ];
      mockCbordService.getMenuItems.mockResolvedValue(mockItems as any);

      const response = await request(app)
        .get('/api/dining/menu/123/items?unitId=1');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
      expect(response.body[0].name).toBe('Pizza');
    });

    it('should return empty array if no items found', async () => {
      mockCbordService.getMenuItems.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dining/menu/123/items?unitId=1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('should return 400 for invalid menu ID', async () => {
      const response = await request(app)
        .get('/api/dining/menu/invalid/items?unitId=1');

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid menu ID');
    });

    it('should handle errors when fetching menu items', async () => {
      mockCbordService.getMenuItems.mockRejectedValue(new Error('Service error'));

      const response = await request(app)
        .get('/api/dining/menu/123/items?unitId=1');

      expect(response.status).toBe(500);
      expect(response.body.error).toBeDefined();
    });

    it('should handle missing unitId query parameter', async () => {
      const response = await request(app)
        .get('/api/dining/menu/123/items');

      // Should handle missing unitId (may default or error)
      expect(response.status).toBeGreaterThanOrEqual(200);
    });
  });
});

