/**
 * Base API Client utility for handling fetch requests to the local /api routes.
 * This simplifies error handling and JSON parsing for the frontend.
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface FetchOptions extends RequestInit {
  body?: any;
}

// In-flight requests map to prevent duplicate simultaneous fetches
const inFlightRequests = new Map<string, Promise<any>>();

// Helper to get cached item from sessionStorage (with TTL checks)
const getSessionCachedItem = (url: string) => {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem(`api_cache:${url}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      // TTL: 5 minutes (300,000 ms) for static routes like profiles & roles, 3 seconds for dynamic routes
      const isStaticRoute = url.includes('/api/profiles/') || url.includes('/api/super-admin/roles');
      const ttl = isStaticRoute ? 300000 : 3000;
      if (Date.now() - parsed.timestamp < ttl) {
        return parsed.data;
      }
    }
  } catch (e) {
    // Ignore error
  }
  return null;
};

// Helper to set cached item in sessionStorage
const setSessionCachedItem = (url: string, data: any) => {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(
      `api_cache:${url}`,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch (e) {
    // Ignore error
  }
};

// Helper to clear all api caches from sessionStorage
export const clearSessionCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('api_cache:')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch (e) {
    // Ignore error
  }
};

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

  const method = customConfig.method || (body ? 'POST' : 'GET');
  const isGet = method === 'GET';

  const config: RequestInit = {
    ...customConfig,
    method,
    headers,
    mode: 'cors',
    credentials: 'include', // Penting agar cookie session dikirim
  };

  if (body) {
    config.body = (typeof FormData !== 'undefined' && body instanceof FormData) ? body : JSON.stringify(body);
  }

  // Jika melakukan mutasi (POST, PUT, DELETE, PATCH), invalidate seluruh cache
  if (!isGet) {
    clearSessionCache();
  }

  if (isGet) {
    // 1. Cek jika data ada di sessionStorage cache dan belum expired
    const cachedData = getSessionCachedItem(fullUrl);
    if (cachedData !== null) {
      return cachedData;
    }
    
    // 2. Cek jika ada request yang sama persis sedang berjalan (Deduplication)
    if (inFlightRequests.has(fullUrl)) {
      return inFlightRequests.get(fullUrl)!;
    }
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(fullUrl, config);
      const data = await response.json();

      let result;
      if (response.ok) {
        result = { data, error: null };
      } else {
        result = { data: null, error: data?.error || response.statusText };
      }

      // Simpan ke sessionStorage cache jika request GET berhasil
      if (isGet && response.ok) {
        setSessionCachedItem(fullUrl, result);
      }

      return result;
    } catch (err: any) {
      return { data: null, error: err.message || 'Network error' };
    } finally {
      if (isGet) {
        inFlightRequests.delete(fullUrl);
      }
    }
  })();

  if (isGet) {
    inFlightRequests.set(fullUrl, fetchPromise);
  }

  return fetchPromise;
}
