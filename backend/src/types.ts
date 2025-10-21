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
  photos?: Array<{
    storage_key: string;
    display_order: number;
  }>;
}

export interface CreateUserRequest {
  username: string;
  email: string;
}
