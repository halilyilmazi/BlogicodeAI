import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://blogicode-ai.vercel.app/api';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Bir hata oluştu';
    return Promise.reject(new Error(message));
  }
);

export default client;
