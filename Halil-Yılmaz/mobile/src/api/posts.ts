import client from './client';
import { Post, CreatePostPayload } from '../types';

export const getPosts = (params?: {
  sort?: 'recent' | 'popular' | 'oldest';
  topic?: string;
  q?: string;
}): Promise<{ posts: Post[] }> =>
  client.get('/posts', { params }).then((r) => ({ posts: r.data.data ?? r.data.posts ?? [] }));

export const getPost = (id: string): Promise<Post> =>
  client.get(`/posts/${id}`).then((r) => r.data);

export const createPost = (payload: CreatePostPayload): Promise<Post> =>
  client.post('/posts', payload).then((r) => r.data);

export const deletePost = (id: string, authorId: string): Promise<void> =>
  client.delete(`/posts/${id}`, { params: { authorId } }).then((r) => r.data);

export const reactToPost = (
  id: string,
  userId: string,
  action: 'like' | 'favorite'
): Promise<Post> =>
  client.post(`/posts/${id}/react`, { userId, action }).then((r) => r.data);
