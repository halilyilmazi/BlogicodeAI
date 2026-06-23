import client from './client';
import { User, UpdateUserPayload } from '../types';

export const getUser = (id: string): Promise<{ user: User; posts: any[] }> =>
  client.get(`/users/${id}`).then((r) => r.data);

export const updateUser = (id: string, payload: UpdateUserPayload): Promise<User> =>
  client.put(`/users/${id}`, payload).then((r) => r.data);

export const deleteUser = (id: string): Promise<void> =>
  client.delete(`/users/${id}`).then((r) => r.data);
