import client from './client';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types';

export const register = (payload: RegisterPayload): Promise<AuthResponse> =>
  client.post('/auth/register', payload).then((r) => r.data);

export const login = (payload: LoginPayload): Promise<AuthResponse> =>
  client.post('/auth/login', payload).then((r) => r.data);
