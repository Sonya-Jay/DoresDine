export interface ImageData {
  uri: string;
  rating: number;
  dishName?: string;
}

export interface DiningHall {
  id: number;
  name: string;
  cbordUnitId: number;
  isOpen?: boolean;
}

export type DayMenu = {
  date: string;
  meals: MealPeriod[];
};

export type MealPeriod = {
  id: number;
  name: string;
};

export type MenuItem = {
  name: string;
  description?: string;
  calories?: number;
  allergens?: string[];
  mealType?: string;
};

export interface FilterOptions {
  allergens: string[];
  mealTypes: string[];
}

// Backend response format for posts
// Note: Backend uses UUIDs (strings) for IDs, but may return them as strings or numbers
// depending on database configuration
export interface BackendPost {
  id: string | number; // UUID from database, may be string or number
  author_id: string;
  caption: string | null;
  rating: number | null;
  menu_items: string[] | null;
  dining_hall_name: string | null;
  meal_type: string | null;
  created_at: string;
  username: string;
  email: string;
  like_count: number;
  comment_count: number;
  is_liked: boolean;
  photos: {
    id: string | number;
    storage_key: string;
    display_order: number;
    dish_name?: string;
  }[];
}

// Frontend display format for posts
export interface Post {
  id: number | string; // Backend ID (UUID string or number) - use for API calls
  author_id?: string; // User ID of the post author
  username: string;
  dininghall: string;
  date: string;
  created_at?: string; // Timestamp for sorting by newest
  mealType?: string; // Meal type (Breakfast, Lunch, Dinner, etc.)
  visits: number;
  images: ImageData[];
  notes: string;
  menuItems: string[];
  rating: number;
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
}

export interface Comment {
  id: string;
  text: string;
  username: string;
  created_at: string;
}

export interface PostData {
  restaurantId: string;
  restaurantName: string;
  date: string;
  mealType: string;
  menuItems: string[];
  rating: number;
  companions: string[];
  notes: string;
  photos: string[];
}

// Database types for when you integrate Postgres
export interface DatabasePost {
  id: number;
  user_id: number;
  restaurant_id: number;
  meal_type: string;
  rating: "liked" | "fine" | "disliked";
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseDiningHall {
  id: number;
  name: string;
  location: string;
  created_at: string;
}

export interface DatabaseUser {
  id: number;
  username: string;
  email: string;
  created_at: string;
}
