/**
 * @format
 */

import { api } from '../components/api/client';

// Mock the environment variable
jest.mock('@env', () => ({
  API_URL: 'http://localhost:3000/',
}));

// @ts-ignore
const globalAny: any = global;

describe('API Client', () => {
  const originalFetch = globalAny.fetch;

  beforeEach(() => {
    globalAny.fetch = jest.fn();
  });

  afterEach(() => {
    globalAny.fetch = originalFetch;
  });

  describe('getHalls', () => {
    it('fetches dining halls successfully', async () => {
      const mockHalls = [
        { id: 1, name: 'Rand Dining Center', cbordUnitId: 1 },
        { id: 2, name: 'The Commons', cbordUnitId: 2 },
      ];

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockHalls,
      });

      const result = await api.getHalls();

      expect(result).toEqual(mockHalls);
      expect(globalAny.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dining/halls',
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('throws error when fetch fails', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ error: 'Server error' }),
      });

      await expect(api.getHalls()).rejects.toThrow('Server error');
    });

    it('throws error with message field when present', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: 'Bad request' }),
      });

      await expect(api.getHalls()).rejects.toThrow('Bad request');
    });

    it('throws generic error when response has no error or message', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      });

      await expect(api.getHalls()).rejects.toThrow('HTTP 404');
    });

    it('throws HTTP status error when response text is empty', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => '',
      });

      await expect(api.getHalls()).rejects.toThrow('HTTP 500');
    });

    it('handles text() rejection gracefully', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => {
          throw new Error('Cannot read text');
        },
      });

      await expect(api.getHalls()).rejects.toThrow('HTTP 500');
    });
  });

  describe('getHallMenu', () => {
    it('fetches hall menu successfully', async () => {
      const mockMenu = {
        hall: 'Rand',
        schedule: [
          {
            date: '2025-11-10',
            meals: [
              { id: 1, name: 'Breakfast', startTime: '07:00', endTime: '10:00' },
            ],
          },
        ],
      };

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockMenu,
      });

      const result = await api.getHallMenu(1);

      expect(result).toEqual(mockMenu);
      expect(globalAny.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dining/halls/1/menu',
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('throws error when fetch fails', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => JSON.stringify({ error: 'Hall not found' }),
      });

      await expect(api.getHallMenu(999)).rejects.toThrow('Hall not found');
    });
  });

  describe('getMenuItems', () => {
    it('fetches menu items successfully', async () => {
      const mockItems = [
        { name: 'Pizza', description: 'Cheese pizza', calories: 285 },
        { name: 'Salad', description: 'Garden salad', calories: 150 },
      ];

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockItems,
      });

      const result = await api.getMenuItems(101, 1);

      expect(result).toEqual(mockItems);
      expect(globalAny.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dining/menu/101/items?unitId=1',
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    });

    it('throws error when fetch fails', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ error: 'Failed to fetch items' }),
      });

      await expect(api.getMenuItems(101, 1)).rejects.toThrow(
        'Failed to fetch items'
      );
    });
  });

  describe('request error handling', () => {
    it('handles non-JSON error responses', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(api.getHalls()).rejects.toThrow('HTTP 500');
    });

    it('handles malformed JSON in error response', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => '{invalid json}',
      });

      await expect(api.getHalls()).rejects.toThrow('HTTP 500');
    });
  });

  describe('URL handling', () => {
    it('strips trailing slash from API_URL', async () => {
      const mockHalls = [{ id: 1, name: 'Test Hall', cbordUnitId: 1 }];

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockHalls,
      });

      await api.getHalls();

      // Should call with clean URL (no double slashes)
      expect(globalAny.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dining/halls',
        expect.any(Object)
      );
    });
  });
});
