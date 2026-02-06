
export type ContentType = 'Video' | 'Post' | 'Script';
export type PostStatus = 'public' | 'private';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Post {
  id: string;
  type: ContentType;
  userId: string;
  userName: string;
  userPhoto: string;
  title: string;
  poster: string; // Thumbnail
  videoUrl?: string; // Actual video file link
  document?: string; // Description
  scriptContent?: string;
  pollOptions?: PollOption[];
  createdAt: number;
  revenue: number;
  hezzEnabled: boolean;
  likes: number;
  status: PostStatus;
  comments: Comment[];
}

export interface UserProfile {
  uid: string;
  name: string;
  photo: string;
  bio: string;
  earnings: number;
  hezzStatus: 'none' | 'pending' | 'active' | 'denied';
  isAdmin: boolean;
  isSuspended: boolean;
}

export enum AppTab {
  Home = 'home',
  Upload = 'upload',
  Account = 'account',
  Admin = 'admin'
}
