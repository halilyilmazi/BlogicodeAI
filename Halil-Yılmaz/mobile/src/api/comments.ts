import client from './client';
import { Comment } from '../types';

export const getComments = (postId: string): Promise<{ comments: Comment[] }> =>
  client.get(`/posts/${postId}/comments`).then((r) => ({ comments: r.data.data ?? r.data.comments ?? [] }));

export const addComment = (
  postId: string,
  authorId: string,
  content: string
): Promise<Comment> =>
  // Backend { message, comment } döndürür; ekrana eklemek için gerçek yorumu çıkar.
  // Böylece yeni yorum ilk seferde doğru tarih (createdAt) ve _id ile gelir.
  client.post(`/posts/${postId}/comments`, { authorId, content }).then((r) => r.data.comment ?? r.data);

export const deleteComment = (commentId: string, authorId: string): Promise<void> =>
  client.delete(`/comments/${commentId}`, { params: { authorId } }).then((r) => r.data);
