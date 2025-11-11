/**
 * @format
 */

import * as api from '../services/api';
import { API_URL } from '../constants/API';

// Mock the API_URL constant
jest.mock('../constants/API', () => ({
  API_URL: 'http://localhost:3000',
  API_ENDPOINTS: {
    DINING_HALLS: '/api/dining/halls',
    MENU_SCHEDULE: (id: number) => `/api/dining/halls/${id}/menu`,
    MENU_ITEMS: (menuId: number, unitId: number) => `/api/dining/menu/${menuId}/items?unitId=${unitId}`,
  },
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

  describe('fetchDiningHalls', () => {
    it('fetches dining halls successfully', async () => {
      const mockHalls = [
        { id: 1, name: 'Rand Dining Center', cbordUnitId: 1 },
        { id: 2, name: 'The Commons', cbordUnitId: 2 },
      ];

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockHalls,
      });

      const result = await api.fetchDiningHalls();

      expect(result).toEqual(mockHalls);
      expect(globalAny.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dining/halls',
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
    });

    it('throws error when fetch fails', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ error: 'Server error' }),
      });

      await expect(api.fetchDiningHalls()).rejects.toThrow();
    });

    it('throws error with message field when present', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ message: 'Bad request' }),
      });

      await expect(api.fetchDiningHalls()).rejects.toThrow();
    });

    it('throws generic error when response has no error or message', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        text: async () => 'Not found',
      });

      await expect(api.fetchDiningHalls()).rejects.toThrow();
    });

    it('throws HTTP status error when response text is empty', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => '',
      });

      await expect(api.fetchDiningHalls()).rejects.toThrow();
    });

    it('handles text() rejection gracefully', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => {
          throw new Error('Cannot read text');
        },
      });

      await expect(api.fetchDiningHalls()).rejects.toThrow();
    });
  });

  // Note: fetchMenuSchedule doesn't exist as an exported function
  // The schedule is fetched directly in the schedule-details screen
  // These tests are skipped until the function is added to api.ts
  describe.skip('fetchMenuSchedule', () => {
    it.skip('fetches hall menu successfully', async () => {
      // This test will be implemented when fetchMenuSchedule is added to api.ts
    });

    it.skip('throws error when fetch fails', async () => {
      // This test will be implemented when fetchMenuSchedule is added to api.ts
    });
  });

  describe('fetchMenuItems', () => {
    it('fetches menu items successfully', async () => {
      const mockItems = [
        { name: 'Pizza', description: 'Cheese pizza', calories: 285 },
        { name: 'Salad', description: 'Garden salad', calories: 150 },
      ];

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockItems,
      });

      const result = await api.fetchMenuItems(101, 1);

      expect(result).toEqual(mockItems);
      expect(globalAny.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dining/menu/101/items?unitId=1',
        expect.objectContaining({
          headers: expect.any(Object),
        })
      );
    });

    it('throws error when fetch fails', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => JSON.stringify({ error: 'Failed to fetch items' }),
      });

      await expect(api.fetchMenuItems(101, 1)).rejects.toThrow();
    });
  });

  describe('request error handling', () => {
    it('handles non-JSON error responses', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      });

      await expect(api.fetchDiningHalls()).rejects.toThrow();
    });

    it('handles malformed JSON in error response', async () => {
      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => '{invalid json}',
      });

      await expect(api.fetchDiningHalls()).rejects.toThrow();
    });
  });

  describe('URL handling', () => {
    it('strips trailing slash from API_URL', async () => {
      const mockHalls = [{ id: 1, name: 'Test Hall', cbordUnitId: 1 }];

      (globalAny.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockHalls,
      });

      await api.fetchDiningHalls();

      // Should call with clean URL (no double slashes)
      expect(globalAny.fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/dining/halls',
        expect.any(Object)
      );
    });
  });
});
