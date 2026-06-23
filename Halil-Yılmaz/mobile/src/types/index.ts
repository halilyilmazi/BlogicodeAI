export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  bio?: string;
  profession?: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  profilePhoto?: string;
  createdAt: string;
}

export interface Post {
  _id: string;
  title: string;
  content: string;
  category: string;
  tags?: string[];
  authorId: string | User;
  likes?: number;
  favorites?: number;
  likeCount?: number;
  favoriteCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface Comment {
  _id: string;
  postId: string;
  authorId: string | User;
  content: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  bio?: string;
  profession?: string;
  gender?: string;
  birthDate?: string;
  phone?: string;
  profilePhoto?: string;
}

export interface CreatePostPayload {
  title: string;
  content: string;
  category: string;
  authorId: string;
  tags?: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  PostDetail: { postId: string; post?: Post };
  EditProfile: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  CreatePost: undefined;
  Chatbot: undefined;
  Profile: undefined;
};
