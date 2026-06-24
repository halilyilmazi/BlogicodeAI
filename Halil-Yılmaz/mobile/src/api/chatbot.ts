import client from './client';
import { ChatMessage } from '../types';

export interface ChatbotResponse {
  reply: string;
  source?: 'gemini' | 'fallback';
  hint?: string;
}

/**
 * Yanıttan sohbet dışı eklentileri temizler: canlı haber akışı / GEMINI_API_KEY
 * ipuçları ve "— Kaynaklar —" listesi. Asistan ekranında yalnızca sohbet kalır.
 */
function sanitizeReply(text: string): string {
  if (!text) return text;
  let out = text;
  // "— Kaynaklar —" ve sonrasındaki kaynak/haber listesini at.
  out = out.replace(/\n*[—-]+\s*Kaynaklar\s*[—-]+[\s\S]*$/i, '');
  // GEMINI_API_KEY / canlı haber akışı dipnotunu at (italik parantezli ipucu).
  out = out
    .split('\n')
    .filter((line) => !/(GEMINI_API_KEY|GEMINI_ENABLE_SEARCH|canlı haber akışı)/i.test(line))
    .join('\n');
  return out.trim();
}

/**
 * Sohbet mesajını ve geçmişi backend'e gönderir.
 * Backend geçmişi { role: 'user' | 'model', text } formatında bekler;
 * uygulama içindeki 'assistant' rolü 'model'e dönüştürülür.
 */
export const sendMessage = (
  message: string,
  history: ChatMessage[] = []
): Promise<ChatbotResponse> =>
  client
    .post('/chatbot', {
      message,
      history: history.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.content,
      })),
    })
    .then((r) => ({ ...r.data, reply: sanitizeReply(r.data?.reply ?? '') }));
