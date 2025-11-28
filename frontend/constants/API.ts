// API configuration
// Set your AWS backend URL here or via environment variable
// For Expo, use EXPO_PUBLIC_API_URL in a .env file in the frontend directory
// Example: EXPO_PUBLIC_API_URL=https://your-api.aws-region.elasticbeanstalk.com

// For local development, use localhost. For production, use AWS URL or set EXPO_PUBLIC_API_URL
const LOCAL_BACKEND = "http://localhost:3000";
const AWS_BACKEND = "http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com";

// Determine which backend to use
// In development, always use localhost. In production builds, use AWS.
// You can override with EXPO_PUBLIC_API_URL environment variable
export const API_URL = 
  typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL 
    ? process.env.EXPO_PUBLIC_API_URL 
    : (typeof __DEV__ !== 'undefined' && __DEV__) ? LOCAL_BACKEND : AWS_BACKEND;

// Log which backend is being used (for debugging)
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('[API] Using backend:', API_URL);
}

// Helper function to get API URL (useful for debugging)
export const getApiUrl = () => API_URL;

// API endpoints - matching backend routes
export const API_ENDPOINTS = {
  POSTS: '/posts',
  POST: (id: number) => `/posts/${id}`,
  POST_COMMENTS: (id: number) => `/posts/${id}/comments`,
  POST_LIKE: (id: number) => `/posts/${id}/like`,
  UPLOAD_PHOTO: '/upload/photo',
  DINING_HALLS: '/api/dining/halls',
  MENU_ITEMS: (menuId: number, unitId: number) => `/api/dining/menu/${menuId}/items?unitId=${unitId}`,
  MENU_SCHEDULE: (hallId: number) => `/api/dining/halls/${hallId}/menu`,

  // Friend/Follow endpoints
  FOLLOWS_FOLLOWING: '/follows/following',
  FOLLOWS_FOLLOWERS: '/follows/followers',
  FOLLOWS_ACTIVITY: '/follows/activity',
  FOLLOWS_SUGGESTIONS: '/follows/suggestions',
  FOLLOW_USER: (userId: string) => `/follows/${userId}`,
  UNFOLLOW_USER: (userId: string) => `/follows/${userId}`,
  CHECK_FOLLOWING: (userId: string) => `/follows/check/${userId}`,
} as const;

// Helper to construct photo URL from storage_key
export const getPhotoUrl = (storageKey: string): string => {
  // If storage_key is already a full URL (S3 or other), return it
  if (storageKey.startsWith('http://') || storageKey.startsWith('https://')) {
    return storageKey;
  }
  // Backend returns storage_key as relative path like "uploads/filename.jpg"
  // Backend serves uploads from /uploads route (see backend/src/index.ts)
  // This is fallback for local storage (not recommended for production)
  const baseUrl = API_URL.replace(/\/$/, ''); // Remove trailing slash
  const key = storageKey.startsWith('/') ? storageKey : `/${storageKey}`;
  return `${baseUrl}${key}`;
};
