export interface User {
  id: string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  email_verified?: boolean;
  created_at: Date;
}

export interface Post {
  id: string;
  author_id: string;
  caption: string | null;
  rating: number | null;
  menu_items: string[] | null;
  dining_hall_name: string | null;
  meal_type: string | null;
  created_at: Date;
}

export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: Date;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  text: string;
  created_at: Date;
}

export interface PostPhoto {
  id: string;
  post_id: string;
  storage_key: string;
  display_order: number;
  created_at: Date;
}

export interface PostWithPhotos extends Post {
  photos: PostPhoto[];
}

export interface CreatePostRequest {
  caption?: string;
  rating?: number;
  menu_items?: string[];
  dining_hall_name?: string;
  meal_type?: string;
  photos?: Array<{
    storage_key: string;
    display_order: number;
  }>;
}

export interface CreateUserRequest {
  username: string;
  email: string;
}
