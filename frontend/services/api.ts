// Update current user profile
export const updateProfile = async (
  updates: Partial<
    User & {
      bio?: string;
      first_name?: string;
      last_name?: string;
      gender?: string;
      birthday?: string;
      phone?: string;
      notification_pref?: string;
      language?: string;
      timezone?: string;
      privacy?: string;
      theme?: string;
      profile_photo?: string;
      password?: string;
    }
  >
) => {
  const res = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    let errorMessage = "Profile update failed";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  const user = await res.json();
  currentUser = user;
  return user;
};
import { API_ENDPOINTS, API_URL, getPhotoUrl } from "@/constants/API";
import { BackendPost, Comment, Post, PostData } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";

// User ID storage - in production, use AsyncStorage or auth context
let currentUserId: string | null = null;
let authToken: string | null = null;
let currentUser: any = null;

// User interface for API responses
interface User {
  id: string;
  username: string;
  email: string;
  created_at: string;
}

// Create or get a user
export const getOrCreateUser = async (
  username: string = "testuser",
  email: string = "testuser@example.com"
): Promise<string> => {
  // If we already have a user ID, return it
  if (currentUserId) {
    return currentUserId;
  }

  try {
    // Try to create a user
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email }),
    });

    if (response.ok) {
      const user: User = await response.json();
      currentUserId = user.id;
      console.log("✅ User created:", user.id);
      return user.id;
    } else {
      // User might already exist, try to get by username
      const error = await response
        .json()
        .catch(() => ({ error: response.statusText }));

      if (response.status === 409 && error.error?.includes("already exists")) {
        // User exists, try to fetch by username
        const getUserResponse = await fetch(
          `${API_URL}/users/username/${username}`
        );
        if (getUserResponse.ok) {
          const user: User = await getUserResponse.json();
          currentUserId = user.id;
          console.log("✅ User found:", user.id);
          return user.id;
        }
      }

      throw new Error(error.error || "Failed to create/get user");
    }
  } catch (error: any) {
    console.error("Error creating/getting user:", error);
    // Fallback to the user we created earlier
    currentUserId = "d14e38ed-daed-4328-a9e7-f4beb8a7ba8c";
    return currentUserId;
  }
};

// Get current user ID (will create one if needed)
const getUserId = async (): Promise<string> => {
  if (currentUserId) {
    return currentUserId;
  }

  // Create/get user on first call
  return await getOrCreateUser();
};

// Synchronous version for headers (uses stored ID or fallback)
const getUserIdSync = (): string => {
  // Use the created user ID as fallback
  return currentUserId || "d14e38ed-daed-4328-a9e7-f4beb8a7ba8c";
};

// Helper function to get headers with user ID
const getHeaders = (includeContentType: boolean = true): HeadersInit => {
  const headers: HeadersInit = {};
  // Only use Authorization bearer token - no fallback to X-User-Id
  // This ensures we require proper authentication
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  // If no token, don't add any auth header (will fail auth checks)

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
};

// Auth helpers
export const authRegister = async (payload: { first_name: string; last_name: string; email: string; password: string; confirm_password: string; }) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorMessage = "Registration failed";
    try {
      const errorData = await res.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // If response is not JSON, use status text
      errorMessage = res.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  // Return the full response including verification_code if present (dev mode)
  return data;
};

export const authResend = async (email: string) => {
  const res = await fetch(`${API_URL}/auth/resend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Failed to resend");
  }

  // Return the full response including verification_code if present (dev mode)
  return data;
};

export const authVerify = async (email: string, code: string) => {
  const res = await fetch(`${API_URL}/auth/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || "Verification failed");
  }

  if (data.token) {
    authToken = data.token;
    await AsyncStorage.setItem("authToken", authToken as string);
  }
  return data.token;
};

// Login with email and password
export const authLogin = async (email: string, password: string) => {
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    // Parse JSON response
    let data;
    try {
      data = await res.json();
    } catch (parseError) {
      // If response is not JSON, throw error with status text
      throw new Error(res.statusText || "Invalid response from server");
    }

    // Check if response is OK
    if (!res.ok) {
      throw new Error(
        data.error || `Login failed: ${res.status} ${res.statusText}`
      );
    }

    // Store token if present
    if (data.token) {
      authToken = data.token;
      await AsyncStorage.setItem("authToken", authToken as string);
      return data.token;
    } else {
      throw new Error("No token received from server");
    }
  } catch (error: any) {
    // Re-throw with more context if it's a network error
    if (
      error.message &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("Network request failed"))
    ) {
      throw new Error(
        "Network error: Could not connect to server. Please check your internet connection."
      );
    }
    throw error;
  }
};

// Microsoft Azure AD authentication
export const authMicrosoft = async (microsoftToken: string) => {
  try {
    const res = await fetch(`${API_URL}/auth/microsoft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: microsoftToken }),
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Microsoft authentication failed');
    }
    
    if (data.token) {
      authToken = data.token;
      currentUserId = data.user?.id;
      try {
        await AsyncStorage.setItem('authToken', data.token);
        if (data.user?.id) {
          await AsyncStorage.setItem('userId', data.user.id);
        }
        // Store user info
        currentUser = data.user;
      } catch (err) {
        console.error('Failed to store auth token', err);
      }
    }
    
    return data;
  } catch (error: any) {
    // Re-throw with more context if it's a network error
    if (error.message && (error.message.includes('Failed to fetch') || error.message.includes('Network request failed'))) {
      throw new Error('Network error: Could not connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

// Initialize token from storage (call on app startup if desired)
export const initAuthFromStorage = async () => {
  try {
    const t = await AsyncStorage.getItem("authToken");
    if (t) authToken = t;
  } catch (err) {
    console.error("Failed to load auth token", err);
  }
};

export const getMe = async () => {
  try {
    const res = await fetch(`${API_URL}/users/me`, {
      headers: getHeaders(false),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(err.error || "Failed to fetch current user");
    }
    const user = await res.json();
    currentUser = user;
    currentUserId = user.id;
    return user;
  } catch (err) {
    // rethrow so callers can handle redirect/cleanup
    throw err;
  }
};

// Get user by ID
export const getUserById = async (userId: string) => {
  try {
    const url = `${API_URL}/users/${userId}`;
    const res = await fetch(url, {
      headers: getHeaders(false),
    });
    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = res.statusText;
      try {
        const err = JSON.parse(errorText);
        errorMessage = err.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      // Only log non-500 errors (500 errors are expected until backend is deployed)
      if (res.status !== 500) {
        console.warn(`[API] Failed to fetch user ${userId}:`, errorMessage);
      }
      throw new Error(errorMessage);
    }
    const user = await res.json();
    return user;
  } catch (err: any) {
    // Re-throw but don't log 500 errors (expected until backend deployment)
    if (!err.message || !err.message.includes("Internal server error")) {
      console.warn(`[API] Error in getUserById for ${userId}:`, err.message);
    }
    throw err;
  }
};

// Fetch posts by user ID
export const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  try {
    await initAuthFromStorage();

    const url = `${API_URL}/posts/user/${userId}`;
    console.log(`[API] Fetching posts for user from: ${url}`);
    const response = await fetch(url, {
      headers: getHeaders(false),
    });

    console.log(`[API] Posts response status: ${response.status}`);
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      console.error(
        `[API] Failed to fetch posts for user ${userId}:`,
        errorMessage
      );
      throw new Error(errorMessage);
    }

    const backendPosts: BackendPost[] = await response.json();
    console.log(
      `[API] Fetched ${backendPosts.length} posts for user ${userId}`
    );
    return backendPosts.map(transformPost);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    throw error;
  }
};

export const logout = async () => {
  authToken = null;
  currentUser = null;
  currentUserId = null;
  try {
    await AsyncStorage.removeItem("authToken");
  } catch (err) {
    console.error("Failed to clear auth token", err);
  }
};

export const getCurrentUser = () => currentUser;

// Transform backend post to frontend post format
const transformPost = (backendPost: BackendPost): Post => {
  // Extract date and format it
  const date = new Date(backendPost.created_at);
  const dateStr = date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });
  const mealType = backendPost.meal_type || "Lunch";
  const formattedDate = `${dateStr} ${mealType}`;

  // Build images array from photos
  // Filter out any photos with empty storage_key and ensure we have valid URLs
  // Also filter out HEIC files as React Native Image doesn't support them

  const images = (backendPost.photos || [])
    .filter((photo) => {
      if (!photo.storage_key || photo.storage_key.trim().length === 0) {
        return false;
      }
      // Filter out HEIC files - React Native Image doesn't support them
      const extension = photo.storage_key.toLowerCase().split(".").pop();
      if (extension === "heic" || extension === "heif") {
        console.warn("Skipping HEIC file (not supported):", photo.storage_key);
        return false;
      }
      return true;
    })
    .map((photo) => {
      const photoUrl = getPhotoUrl(photo.storage_key);
      // Use dish_name from backend if available
      return {
        uri: photoUrl,
        rating: backendPost.rating || 5.0,
        dishName: photo.dish_name,
      };
    });

  // Keep the original ID from backend (could be UUID string or number)
  // Components will use this ID for API calls
  return {
    id: backendPost.id, // Keep original ID (string UUID or number)
    author_id: backendPost.author_id, // Include author ID for navigation
    username: backendPost.username,
    dininghall: backendPost.dining_hall_name || "Unknown",
    date: formattedDate,
    created_at: backendPost.created_at, // Keep timestamp for sorting
    mealType: backendPost.meal_type || undefined, // Include meal type for filtering
    visits: 1, // TODO: Get from backend if available
    images,
    notes: backendPost.caption || "",
    menuItems: backendPost.menu_items || [],
    rating: backendPost.rating || 5.0,
    likeCount: Number(backendPost.like_count) || 0,
    commentCount: Number(backendPost.comment_count) || 0,
    isLiked: backendPost.is_liked || false,
  };
};

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${API_URL}${API_ENDPOINTS.POSTS}`, {
      headers: getHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch posts: ${response.statusText}`);
    }

    const backendPosts: BackendPost[] = await response.json();
    return backendPosts.map(transformPost);
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw error;
  }
};

// Fetch posts by dining hall name
export const fetchPostsByDiningHall = async (diningHallName: string): Promise<Post[]> => {
  try {
    const allPosts = await fetchPosts();
    // Filter posts by dining hall name (case-insensitive)
    return allPosts.filter(
      (post) => post.dininghall.toLowerCase() === diningHallName.toLowerCase()
    );
  } catch (error) {
    console.error("Error fetching posts by dining hall:", error);
    throw error;
  }
};

// Fetch posts from friends (users you follow) with rating >= 6.7
export const fetchFriendPosts = async (): Promise<Post[]> => {
  try {
    await initAuthFromStorage();

    const response = await fetch(`${API_URL}/follows/activity`, {
      headers: getHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch friend posts: ${response.statusText}`);
    }

    const backendPosts: BackendPost[] = await response.json();
    return backendPosts.map(transformPost);
  } catch (error) {
    console.error("Error fetching friend posts:", error);
    throw error;
  }
};

// Fetch posts for the authenticated user (profile page)
export const fetchMyPosts = async (): Promise<Post[]> => {
  try {
    // Ensure we have auth token or user ID
    await initAuthFromStorage();

    const response = await fetch(`${API_URL}/posts/me`, {
      headers: getHeaders(false),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const backendPosts: BackendPost[] = await response.json();
    return backendPosts.map(transformPost);
  } catch (error) {
    console.error("Error fetching my posts:", error);
    throw error;
  }
};

// Create a new post
export const createPost = async (postData: PostData): Promise<Post> => {
  try {
    // Ensure user ID is set before creating post
    const userId = await getUserId();
    console.log("Creating post with user ID:", userId);

    // Transform frontend PostData to backend CreatePostRequest format
    // Backend expects rating as NUMERIC(3,1) between 1.0-10.0 (supports 1 decimal place)
    const backendData = {
      caption: postData.notes || null,
      rating: postData.rating
        ? Math.max(1.0, Math.min(10.0, Number(postData.rating.toFixed(1))))
        : null,
      menu_items: postData.menuItems.length > 0 ? postData.menuItems : null,
      dining_hall_name: postData.restaurantName || null,
      meal_type: postData.mealType || null,
      // Send null if no photos, otherwise send array
      photos:
        postData.photos.length > 0
          ? postData.photos.map((storageKey, index) => ({
              storage_key: storageKey,
              display_order: index,
            }))
          : null,
    };

    console.log("Creating post with data:", {
      ...backendData,
      photos: backendData.photos
        ? `${backendData.photos.length} photos`
        : "no photos",
    });

    const response = await fetch(`${API_URL}${API_ENDPOINTS.POSTS}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(backendData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = response.statusText;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If not JSON, use the text or status text
        errorMessage = errorText || errorMessage;
      }

      console.error("Post creation failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
      });

      throw new Error(errorMessage || "Failed to create post");
    }

    const backendPost: BackendPost = await response.json();
    console.log("Post created successfully:", backendPost.id);
    return transformPost(backendPost);
  } catch (error: any) {
    console.error("Error creating post:", error);
    throw error;
  }
};

// Like/unlike a post
// Note: postId can be number or string (UUID) from backend
export const toggleLikePost = async (
  postId: number | string
): Promise<void> => {
  try {
    // Backend expects string UUID in URL, so convert to string
    const postIdStr = String(postId);
    const response = await fetch(`${API_URL}/posts/${postIdStr}/like`, {
      method: "POST",
      headers: getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to like post: ${response.statusText}`);
    }

    // Backend returns { liked: boolean, message: string }
    await response.json();
  } catch (error) {
    console.error("Error liking post:", error);
    throw error;
  }
};

// Fetch comments for a post
export const fetchComments = async (
  postId: number | string
): Promise<Comment[]> => {
  try {
    const postIdStr = String(postId);
    const response = await fetch(`${API_URL}/posts/${postIdStr}/comments`, {
      headers: getHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments: ${response.statusText}`);
    }

    const comments = await response.json();
    // Backend returns comments with id (UUID string), text, created_at, username, email
    return comments.map((c: any) => ({
      id: String(c.id), // Ensure ID is string for Comment type
      text: c.text,
      username: c.username,
      created_at: c.created_at,
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (
  postId: number | string,
  text: string
): Promise<Comment> => {
  try {
    const postIdStr = String(postId);
    const response = await fetch(`${API_URL}/posts/${postIdStr}/comments`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: response.statusText }));
      throw new Error(error.error || "Failed to post comment");
    }

    const comment = await response.json();
    return {
      id: String(comment.id), // Ensure ID is string for Comment type
      text: comment.text,
      username: comment.username,
      created_at: comment.created_at,
    };
  } catch (error) {
    console.error("Error posting comment:", error);
    throw error;
  }
};

// Upload a photo
export const uploadPhoto = async (
  photoUri: string,
  fileName: string = "photo.jpg"
): Promise<string> => {
  try {
    // Determine file type from URI or filename
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "jpg";
    const mimeType =
      fileExtension === "png"
        ? "image/png"
        : fileExtension === "gif"
        ? "image/gif"
        : "image/jpeg";

    // Create FormData - React Native format
    const formData = new FormData();

    // For React Native, we need to format it correctly
    // The uri should be a local file path or data URI
    formData.append("photo", {
      uri: photoUri,
      name: fileName || `photo.${fileExtension}`,
      type: mimeType,
    } as any);

    console.log("Uploading photo:", { uri: photoUri, fileName, mimeType });

    const response = await fetch(`${API_URL}${API_ENDPOINTS.UPLOAD_PHOTO}`, {
      method: "POST",
      body: formData,
      headers: {
        "X-User-Id": getUserIdSync(),
        // Don't set Content-Type - let React Native set it with boundary
      },
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = response.statusText;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
      }
      console.error("Upload failed:", response.status, errorMessage);
      throw new Error(`Failed to upload photo: ${errorMessage}`);
    }

    const result = await response.json();
    console.log("Upload successful:", result);
    return result.storage_key;
  } catch (error: any) {
    console.error("Error uploading photo:", error);
    throw error;
  }
};

// Fetch menu items
export const fetchMenuItems = async (menuId: number, unitId: number) => {
  try {
    const response = await fetch(
      `${API_URL}${API_ENDPOINTS.MENU_ITEMS(menuId, unitId)}`,
      {
        headers: getHeaders(false),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch menu items: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching menu items:", error);
    throw error;
  }
};

// Fetch dining halls
export const fetchDiningHalls = async () => {
  try {
    const url = `${API_URL}${API_ENDPOINTS.DINING_HALLS}`;
    console.log("[DEBUG] Fetching dining halls from:", url);
    const response = await fetch(url, {
      headers: getHeaders(false),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dining halls: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("[DEBUG] Dining halls response:", {
      total: data.length,
      open: data.filter((h: any) => h.isOpen === true).length,
      closed: data.filter((h: any) => h.isOpen === false).length,
      undefined: data.filter(
        (h: any) => h.isOpen === undefined || h.isOpen === null
      ).length,
    });
    return data;
  } catch (error) {
    console.error("Error fetching dining halls:", error);
    throw error;
  }
};

// Search API functions
export interface SearchUser {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}

export interface SearchDiningHall {
  id: number;
  name: string;
  cbordUnitId: number;
}

export interface SearchDish {
  name: string;
  frequency: number;
}

export interface SearchResults {
  users: SearchUser[];
  diningHalls: SearchDiningHall[];
  query: string;
}

// Search all (users, dining halls)
export const search = async (query: string): Promise<SearchResults> => {
  try {
    if (!query || query.trim().length < 2) {
      return { users: [], diningHalls: [], query };
    }

    const response = await fetch(
      `${API_URL}/search?q=${encodeURIComponent(query.trim())}`,
      {
        headers: getHeaders(false),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to search: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching:", error);
    throw error;
  }
};

// Search users
export const searchUsers = async (query: string): Promise<SearchUser[]> => {
  try {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const response = await fetch(
      `${API_URL}/search/users?q=${encodeURIComponent(query.trim())}`,
      {
        headers: getHeaders(false),
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to search users: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Couldn't parse error response
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.users || [];
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// Search dining halls
export const searchDiningHalls = async (
  query: string
): Promise<SearchDiningHall[]> => {
  try {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const response = await fetch(
      `${API_URL}/search/dining-halls?q=${encodeURIComponent(query.trim())}`,
      {
        headers: getHeaders(false),
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to search dining halls: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Couldn't parse error response
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.diningHalls || [];
  } catch (error) {
    console.error("Error searching dining halls:", error);
    throw error;
  }
};

// Search dishes
export const searchDishes = async (query: string): Promise<SearchDish[]> => {
  try {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const response = await fetch(
      `${API_URL}/search/dishes?q=${encodeURIComponent(query.trim())}`,
      {
        headers: getHeaders(false),
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to search dishes: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Couldn't parse error response
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.dishes || [];
  } catch (error) {
    console.error("Error searching dishes:", error);
    throw error;
  }
};

// Get trending dishes (top by frequency)
export const getTrendingDishes = async (
  limit: number = 20
): Promise<SearchDish[]> => {
  try {
    const response = await fetch(
      `${API_URL}/search/trending-dishes?limit=${limit}`,
      {
        headers: getHeaders(false),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch trending dishes: ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.dishes;
  } catch (error) {
    console.error("Error fetching trending dishes:", error);
    throw error;
  }
};

// Search dish availability across dining halls
export interface DishAvailability {
  dish: string;
  today: Array<{ hallId: number; hallName: string; mealPeriod?: string }>;
  later: Array<{ hallId: number; hallName: string; date?: string; mealPeriod?: string }>;
}

export const searchDishAvailability = async (
  query: string
): Promise<DishAvailability> => {
  try {
    if (!query || query.trim().length < 1) {
      return { dish: query, today: [], later: [] };
    }

    const response = await fetch(
      `${API_URL}/search/dish-availability?q=${encodeURIComponent(query.trim())}`,
      {
        headers: getHeaders(false),
      }
    );

    if (!response.ok) {
      let errorMessage = `Failed to search dish availability: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Couldn't parse error response
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error searching dish availability:", error);
    throw error;
  }
};
