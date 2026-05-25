import { createClient } from '@/lib/supabase/client';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  trace_id?: string;
};

class ApiError extends Error {
  code: string;
  details?: Record<string, unknown>;

  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ApiError';
  }
}

function generateTraceId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function getAuthHeaders(idempotencyKey?: string): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token ?? ''}`,
    'X-Trace-Id': generateTraceId(),
  };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return headers;
}

async function getFormDataHeaders(): Promise<Record<string, string>> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Authorization': `Bearer ${session?.access_token ?? ''}`,
  };
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let body: any;
    try { body = await response.json(); } catch { body = {}; }
    const error = body?.error || {};
    throw new ApiError(
      error.code || 'HTTP_ERROR',
      error.message || `HTTP ${response.status}: ${response.statusText}`,
      error.details,
    );
  }
  const json = await response.json();
  if (json.success === false) {
    throw new ApiError(
      json.error?.code || 'UNKNOWN_ERROR',
      json.error?.message || 'Terjadi kesalahan',
      json.error?.details,
    );
  }
  return json.data ?? json;
}

export async function apiGet<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${BACKEND_URL}${path}`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const response = await fetch(url.toString(), { headers: await getAuthHeaders() });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body?: unknown, idempotencyKey?: string): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: await getAuthHeaders(idempotencyKey),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'PUT',
    headers: await getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'DELETE',
    headers: await getAuthHeaders(),
  });
  return handleResponse<T>(response);
}

export async function apiUpload<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: 'POST',
    headers: await getFormDataHeaders(),
    body: formData,
  });
  return handleResponse<T>(response);
}

export { ApiError };
