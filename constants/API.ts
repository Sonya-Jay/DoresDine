// API configuration
// To set your API URL, create a .env file in the root directory with:
// EXPO_PUBLIC_API_URL=http://your-api-url.com
// Or modify this default value directly
export const API_URL = 
  typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL 
    ? process.env.EXPO_PUBLIC_API_URL 
    : "http://localhost:3000";

