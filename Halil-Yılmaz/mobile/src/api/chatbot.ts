import client from './client';

export const sendMessage = (message: string): Promise<{ reply: string }> =>
  client.post('/chatbot', { message }).then((r) => r.data);
