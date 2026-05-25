import { apiPost } from './client';

export const aiChatService = {
  businessChat: (prompt: string) =>
    apiPost<{ response: string }>('/api/v1/ai/business/chat', { prompt }),
  personalChat: (prompt: string) =>
    apiPost<{ response: string }>('/api/v1/ai/personal/chat', { prompt }),
};
