/**
 * Base API Client utility for handling fetch requests to the local /api routes.
 * This simplifies error handling and JSON parsing for the frontend.
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends RequestInit {
  body?: any;
}

export async function apiClient<T = any>(
  endpoint: string,
  { body, ...customConfig }: FetchOptions = {}
): Promise<{ data: T | null; error: string | null }> {
  // Ambil BASE_URL dari environment jika ada (misal untuk testing antar laptop)
  const baseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${cleanEndpoint}`;

  const headers: any = { 
    ...customConfig.headers 
  };

  // Jangan set Content-Type ke application/json jika body adalah FormData
  if (body && typeof FormData !== 'undefined' && body instanceof FormData) {
    // Browser akan otomatis set Content-Type ke multipart/form-data beserta boundary-nya
  } else {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const config: RequestInit = {
    ...customConfig,
    method: customConfig.method || (body ? 'POST' : 'GET'),
    headers,
    mode: 'cors',
    credentials: 'include', // Penting agar cookie session dikirim
  };

  if (body) {
    config.body = (typeof FormData !== 'undefined' && body instanceof FormData) ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(fullUrl, config);
    const data = await response.json();

    if (response.ok) {
      return { data, error: null };
    }

    return { data: null, error: data?.error || response.statusText };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error' };
  }
}
