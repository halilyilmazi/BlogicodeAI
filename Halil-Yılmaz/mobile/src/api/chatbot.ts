import client from './client';
import { ChatMessage } from '../types';

export interface ChatbotResponse {
  reply: string;
  source?: 'gemini' | 'fallback';
  hint?: string;
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
    .then((r) => r.data);
