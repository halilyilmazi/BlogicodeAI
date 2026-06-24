import axios from 'axios';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Canlı (Vercel) API — şu an MongoDB'ye erişemediği için yedek olarak tutulur.
const PROD_URL = 'https://blogicode-ai.vercel.app/api';
const LOCAL_PORT = 3000;

/**
 * Geliştirmede, Expo Metro sunucusunun çalıştığı makinenin IP'sini paket
 * URL'sinden otomatik bulup yerel backend'e (port 3000) bağlanır. Böylece IP
 * elle yazılmaz; telefon (Expo Go) ile bilgisayar aynı Wi-Fi'da olduğu sürece
 * yerel API'ye erişir. IP bulunamazsa canlı (Vercel) API'ye düşer.
 */
function resolveBaseUrl(): string {
  if (!__DEV__) return PROD_URL;
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    // örn: "http://192.168.1.161:8081/index.bundle?platform=ios..."
    const host = scriptURL?.split('://')[1]?.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:${LOCAL_PORT}/api`;
    }
  } catch {
    /* yoksay */
  }
  return PROD_URL;
}

const BASE_URL = resolveBaseUrl();

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
