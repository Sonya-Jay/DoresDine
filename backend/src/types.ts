export interface User {
  id: string;
  username: string;
  email: string;
  created_at: Date;
}

export interface Post {
  id: string;
  author_id: string;
  caption: string | null;
  rating: number;
  menu_items: string[] | null;
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
  photos?: Array<{
    storage_key: string;
    display_order: number;
  }>;
}

export interface CreateUserRequest {
  username: string;
  email: string;
}
