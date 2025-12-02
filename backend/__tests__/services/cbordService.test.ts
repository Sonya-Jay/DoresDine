import cbordService from '../../src/services/cbordService';
import { parse } from 'node-html-parser';

// Mock axios (axios-cookiejar-support and tough-cookie are already mocked in setup.ts)
jest.mock('axios');

// Mock node-html-parser but allow actual parsing in tests
jest.mock('node-html-parser', () => {
  const actual = jest.requireActual('node-html-parser');
  return actual;
});

describe('CbordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDiningHalls', () => {
    it('should return dining halls with status from schedule', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn().mockResolvedValue({
        data: {
          success: true,
          panels: [
            {
              id: 'menuPanel',
              html: '<section class="card"><div class="card-title">Monday, November 11, 2025</div><a class="cbo_nn_menuLink" onclick="javascript:NetNutrition.UI.menuListSelectMenu(123);">Breakfast</a></section>',
            },
          ],
        },
      });

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const halls = await cbordService.getDiningHalls();

      expect(Array.isArray(halls)).toBe(true);
      expect(halls.length).toBeGreaterThan(0);
      expect(halls[0]).toHaveProperty('id');
      expect(halls[0]).toHaveProperty('name');
      expect(halls[0]).toHaveProperty('cbordUnitId');
      expect(halls[0]).toHaveProperty('isOpen');
    });

    it('should handle errors when fetching schedule and default to closed', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn().mockRejectedValue(new Error('Network error'));

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const halls = await cbordService.getDiningHalls();
      expect(Array.isArray(halls)).toBe(true);
      // All halls should default to closed when schedule fetch fails
      halls.forEach((hall: any) => {
        expect(hall.isOpen).toBe(false);
      });
    });

    it('should handle top-level errors and return halls with default status', async () => {
      const mockGet = jest.fn().mockRejectedValue(new Error('Service unavailable'));
      const mockAxiosInstance = {
        get: mockGet,
        post: jest.fn(),
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const halls = await cbordService.getDiningHalls();
      expect(Array.isArray(halls)).toBe(true);
      expect(halls.length).toBeGreaterThan(0);
    });
  });

  describe('getMenuSchedule', () => {
    it('should fetch menu schedule for a dining hall', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn().mockResolvedValue({
        data: {
          success: true,
          panels: [
            {
              id: 'menuPanel',
              html: '<section class="card"><div class="card-title">Monday, November 11, 2025</div><a class="cbo_nn_menuLink" onclick="javascript:NetNutrition.UI.menuListSelectMenu(123);">Breakfast</a></section>',
            },
          ],
        },
      });

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const schedule = await cbordService.getMenuSchedule(1);

      expect(Array.isArray(schedule)).toBe(true);
      expect(schedule.length).toBeGreaterThan(0);
      expect(schedule[0]).toHaveProperty('date');
      expect(schedule[0]).toHaveProperty('meals');
    });

    it('should return empty array when menuPanel HTML is missing', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn().mockResolvedValue({
        data: {
          success: true,
          panels: [
            {
              id: 'otherPanel',
              html: '<div>Other content</div>',
            },
          ],
        },
      });

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const schedule = await cbordService.getMenuSchedule(1);

      expect(Array.isArray(schedule)).toBe(true);
      expect(schedule.length).toBe(0);
    });

    it('should handle empty response', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn().mockResolvedValue(null);

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      await expect(cbordService.getMenuSchedule(1)).rejects.toThrow();
    });

    it('should handle success=false response', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn().mockResolvedValue({
        data: {
          success: false,
        },
      });

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      await expect(cbordService.getMenuSchedule(1)).rejects.toThrow();
    });

    it('should handle axios errors', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { error: 'Server error' },
        },
      };
      const mockPost = jest.fn().mockRejectedValue(axiosError);

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      await expect(cbordService.getMenuSchedule(1)).rejects.toThrow();
    });

    it('should handle errors when fetching menu schedule', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn().mockRejectedValue(new Error('Service error'));

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      await expect(cbordService.getMenuSchedule(1)).rejects.toThrow();
    });
  });

  describe('getMenuItems', () => {
    it('should fetch menu items for a meal using table rows', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn()
        .mockResolvedValueOnce({ data: { success: true } }) // session init
        .mockResolvedValueOnce({ data: { success: true } }) // unit selection
        .mockResolvedValueOnce({
          data: {
            success: true,
            panels: [
              {
                id: 'itemPanel',
                html: '<table><tr class="cbo_nn_itemPrimaryRow"><td><a class="cbo_nn_itemHover">Pizza</a></td><td></td><td>1 slice</td></tr></table>',
              },
            ],
          },
        }); // menu items

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const items = await cbordService.getMenuItems(123, 1);

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBeGreaterThan(0);
    });

    it('should return empty array when success=false', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn()
        .mockResolvedValueOnce({ data: { success: true } })
        .mockResolvedValueOnce({
          data: {
            success: false,
          },
        });

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const items = await cbordService.getMenuItems(123, 1);

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    it('should return empty array when itemPanel HTML is missing', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn()
        .mockResolvedValueOnce({ data: { success: true } })
        .mockResolvedValueOnce({
          data: {
            success: true,
            panels: [
              {
                id: 'otherPanel',
                html: '<div>Other content</div>',
              },
            ],
          },
        });

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const items = await cbordService.getMenuItems(123, 1);

      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    it('should handle errors gracefully and return empty array', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn()
        .mockResolvedValueOnce({ data: { success: true } })
        .mockRejectedValueOnce(new Error('Service error'));

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const items = await cbordService.getMenuItems(123, 1);

      // Should return empty array on error, not throw
      expect(Array.isArray(items)).toBe(true);
      expect(items.length).toBe(0);
    });

    it('should parse menu items with allergens', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn()
        .mockResolvedValueOnce({ data: { success: true } }) // session init
        .mockResolvedValueOnce({ data: { success: true } }) // unit selection
        .mockResolvedValueOnce({
          data: {
            success: true,
            panels: [
              {
                id: 'itemPanel',
                html: '<table><tr class="cbo_nn_itemPrimaryRow"><td><a class="cbo_nn_itemHover">Pizza<img alt="Dairy" /><img alt="Gluten" /></a></td><td></td><td>1 slice</td></tr></table>',
              },
            ],
          },
        }); // menu items

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const items = await cbordService.getMenuItems(123, 1);

      expect(items.length).toBe(1);
      expect(items[0].allergens).toContain('Dairy');
      expect(items[0].allergens).toContain('Gluten');
    });

    it('should fallback to div-based item rows when table rows not found', async () => {
      const mockGet = jest.fn().mockResolvedValue({ data: {} });
      const mockPost = jest.fn()
        .mockResolvedValueOnce({ data: { success: true } })
        .mockResolvedValueOnce({
          data: {
            success: true,
            panels: [
              {
                id: 'itemPanel',
                html: '<div class="cbo_nn_itemRow"><span class="cbo_nn_itemHover">Pizza</span></div>',
              },
            ],
          },
        });

      const mockAxiosInstance = {
        get: mockGet,
        post: mockPost,
      } as any;

      (cbordService as any).axiosInstance = mockAxiosInstance;

      const items = await cbordService.getMenuItems(123, 1);

      expect(Array.isArray(items)).toBe(true);
    });
  });
});

