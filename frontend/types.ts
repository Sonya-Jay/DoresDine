export interface ImageData {
  uri: string;
  rating: number;
}

export interface DiningHall {
  id: number;
  name: string;
  cbordUnitId: number;
}

// Backend response format for posts
export interface BackendPost {
  id: number;
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
  photos: Array<{
    id: number;
    storage_key: string;
    display_order: number;
  }>;
}

// Frontend display format for posts
export interface Post {
  id: number;
  username: string;
  dininghall: string;
  date: string;
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
  rating: 'liked' | 'fine' | 'disliked';
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
