import axios from 'axios';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Canlı (Vercel) API — sadece üretim (production) derlemesinde kullanılır.
const PROD_URL = 'https://blogicode-ai.vercel.app/api';
const LOCAL_PORT = 3000;

// Geliştirmede Expo, Metro IP'sini her zaman veremiyor (SDK 54 / yeni mimari).
// Bu durumda bu bilgisayarın LAN IP'sine bağlanırız. Wi-Fi/ağ değişirse burayı güncelle.
const DEV_FALLBACK_HOST = '192.168.1.161';

/**
 * Geliştirmede yerel backend'e (port 3000) bağlanır:
 *  1) Önce Metro paket URL'sinden bilgisayarın IP'sini otomatik bulmayı dener.
 *  2) Bulamazsa DEV_FALLBACK_HOST'a düşer (Vercel'e DEĞİL) — böylece istekler
 *     yerel backend'e gider ve /canli panelinde görünür.
 * Telefon (Expo Go) ile bilgisayar aynı Wi-Fi'da olmalıdır.
 */
function resolveBaseUrl(): string {
  if (!__DEV__) return PROD_URL;
  let host: string | undefined;
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    // örn: "http://192.168.1.161:8081/index.bundle?platform=ios..."
    host = scriptURL?.split('://')[1]?.split(':')[0];
  } catch {
    /* yoksay */
  }
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    host = DEV_FALLBACK_HOST;
  }
  return `http://${host}:${LOCAL_PORT}/api`;
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
