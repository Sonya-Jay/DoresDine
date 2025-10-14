export interface PostImage {
  uri: string;
  rating: number;
}

export interface Post {
  id: number;
  username: string;
  restaurant: string;
  date: string;
  visits: number;
  images: PostImage[];
  notes: string;
}
