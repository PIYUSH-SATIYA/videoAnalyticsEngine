import axios from 'axios';
import type { ApiResponse } from '../types/api';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  timeout: 120000
});

export async function getReport<T>(path: string, params?: Record<string, unknown>) {
  const response = await client.get<ApiResponse<T>>(path, { params });
  return response.data;
}
