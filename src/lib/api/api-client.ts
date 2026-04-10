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
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const fullUrl = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  // Ambil token dari localStorage jika sedang berjalan di browser
  let token = null;
  if (typeof window !== 'undefined') {
    token = localStorage.getItem('auth_token');
  }

  const headers: any = { 
    'Content-Type': 'application/json', 
    ...customConfig.headers 
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...customConfig,
    method: customConfig.method || (body ? 'POST' : 'GET'),
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
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
