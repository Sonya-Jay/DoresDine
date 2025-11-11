// API configuration
// Set your AWS backend URL here or via environment variable
// For Expo, use EXPO_PUBLIC_API_URL in a .env file in the frontend directory
// Example: EXPO_PUBLIC_API_URL=https://your-api.aws-region.elasticbeanstalk.com

export const API_URL = 
  typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL 
    ? process.env.EXPO_PUBLIC_API_URL 
    : "http://Doresdine-backend-env.eba-j9uthrv7.us-east-2.elasticbeanstalk.com"; // AWS Backend URL

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
} as const;

// Helper to construct photo URL from storage_key
export const getPhotoUrl = (storageKey: string): string => {
  // If storage_key is already a full URL, return it
  if (storageKey.startsWith('http://') || storageKey.startsWith('https://')) {
    return storageKey;
  }
  // Backend returns storage_key as relative path like "uploads/filename.jpg"
  // Backend serves uploads from /uploads route (see backend/src/index.ts)
  const baseUrl = API_URL.replace(/\/$/, ''); // Remove trailing slash
  // storage_key from backend is relative to project root, but served at /uploads
  // So if storage_key is "uploads/file.jpg", we need to serve it as "/uploads/file.jpg"
  const key = storageKey.startsWith('/') ? storageKey : `/${storageKey}`;
  return `${baseUrl}${key}`;
};
