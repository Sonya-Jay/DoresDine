/**
 * API Performance Test
 * Measures load times for various API endpoints
 */

import { API_URL, API_ENDPOINTS } from '@/constants/API';
import { fetchPosts, fetchDiningHalls, getTrendingDishes } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to measure API call time
const measureApiCall = async (
  name: string,
  apiCall: () => Promise<any>
): Promise<{ name: string; time: number; success: boolean; error?: string }> => {
  const startTime = performance.now();
  try {
    await apiCall();
    const endTime = performance.now();
    const duration = endTime - startTime;
    return {
      name,
      time: Math.round(duration),
      success: true,
    };
  } catch (error: any) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    return {
      name,
      time: Math.round(duration),
      success: false,
      error: error.message || 'Unknown error',
    };
  }
};

// Helper to get auth headers
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('authToken');
  const userId = await AsyncStorage.getItem('userId');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(userId ? { 'x-user-id': userId } : {}),
  };
};

describe('API Performance Tests', () => {
  const results: Array<{ name: string; time: number; success: boolean; error?: string }> = [];

  beforeAll(() => {
    // Set up performance timing
    if (typeof performance === 'undefined') {
      (global as any).performance = {
        now: () => Date.now(),
      };
    }
  });

  afterAll(() => {
    // Print results summary
    console.log('\n📊 API Performance Test Results:\n');
    console.log('='.repeat(60));
    console.log(`${'Endpoint'.padEnd(35)} | ${'Time (ms)'.padEnd(10)} | Status`);
    console.log('-'.repeat(60));
    
    results.forEach((result) => {
      const status = result.success ? '✅' : '❌';
      const timeStr = `${result.time}ms`.padEnd(10);
      const nameStr = result.name.padEnd(35);
      console.log(`${nameStr} | ${timeStr} | ${status}`);
      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }
    });
    
    console.log('='.repeat(60));
    
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);
    const avgTime = successful.length > 0
      ? Math.round(successful.reduce((sum, r) => sum + r.time, 0) / successful.length)
      : 0;
    const minTime = successful.length > 0
      ? Math.min(...successful.map((r) => r.time))
      : 0;
    const maxTime = successful.length > 0
      ? Math.max(...successful.map((r) => r.time))
      : 0;

    console.log(`\n📈 Summary:`);
    console.log(`  Total Tests: ${results.length}`);
    console.log(`  Successful: ${successful.length}`);
    console.log(`  Failed: ${failed.length}`);
    console.log(`  Average Time: ${avgTime}ms`);
    console.log(`  Min Time: ${minTime}ms`);
    console.log(`  Max Time: ${maxTime}ms`);
    console.log('');
  });

  test('GET /posts - Fetch all posts', async () => {
    const result = await measureApiCall('GET /posts', async () => {
      await fetchPosts();
    });
    results.push(result);
    expect(result.success).toBe(true);
  }, 30000);

  test('GET /api/dining/halls - Fetch dining halls', async () => {
    const result = await measureApiCall('GET /api/dining/halls', async () => {
      await fetchDiningHalls();
    });
    results.push(result);
    expect(result.success).toBe(true);
  }, 30000);

  test('GET /search/trending - Get trending dishes', async () => {
    const result = await measureApiCall('GET /search/trending', async () => {
      await getTrendingDishes(20);
    });
    results.push(result);
    expect(result.success).toBe(true);
  }, 30000);

  test('GET /users/me - Get current user', async () => {
    const result = await measureApiCall('GET /users/me', async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/users/me`, { headers });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      await response.json();
    });
    results.push(result);
    // This might fail if not authenticated, which is okay
  }, 30000);

  test('GET /follows/following - Get following list', async () => {
    const result = await measureApiCall('GET /follows/following', async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${API_ENDPOINTS.FOLLOWS_FOLLOWING}`, { headers });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      await response.json();
    });
    results.push(result);
    // This might fail if not authenticated, which is okay
  }, 30000);

  test('GET /follows/activity - Get friend activity', async () => {
    const result = await measureApiCall('GET /follows/activity', async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${API_ENDPOINTS.FOLLOWS_ACTIVITY}`, { headers });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      await response.json();
    });
    results.push(result);
    // This might fail if not authenticated, which is okay
  }, 30000);

  test('GET /follows/suggestions - Get friend suggestions', async () => {
    const result = await measureApiCall('GET /follows/suggestions', async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}${API_ENDPOINTS.FOLLOWS_SUGGESTIONS}`, { headers });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      await response.json();
    });
    results.push(result);
    // This might fail if not authenticated, which is okay
  }, 30000);

  test('GET /search - Search endpoint', async () => {
    const result = await measureApiCall('GET /search?q=test', async () => {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/search?q=test`, { headers });
      if (!response.ok) throw new Error(`Status: ${response.status}`);
      await response.json();
    });
    results.push(result);
  }, 30000);

  test('GET /posts/:id/comments - Fetch comments for a post', async () => {
    const result = await measureApiCall('GET /posts/:id/comments', async () => {
      // First get a post ID
      const posts = await fetchPosts();
      if (posts.length > 0) {
        const headers = await getAuthHeaders();
        const response = await fetch(
          `${API_URL}${API_ENDPOINTS.POST_COMMENTS(posts[0].id)}`,
          { headers }
        );
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        await response.json();
      } else {
        throw new Error('No posts available');
      }
    });
    results.push(result);
  }, 30000);
});

