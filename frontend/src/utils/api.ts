import axios from 'axios';
import type { ChatResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 60000, // 60 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function sendMessage(
  sessionId: string,
  message: string
): Promise<ChatResponse> {
  const response = await apiClient.post<ChatResponse>('/chat', {
    session_id: sessionId,
    message,
  });
  return response.data;
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
}
