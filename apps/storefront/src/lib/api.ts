// ============================================================
// API CLIENT — Centralized fetch wrapper for all API calls
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `API Error: ${response.status}`);
    }

    return data;
  }

  // GET
  get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  // POST
  post<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT
  put<T>(endpoint: string, body?: unknown, options?: FetchOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE
  delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_URL);

// ── Typed API Functions ─────────────────────────────────────

export async function getProducts(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return api.get<any>(`/products${query}`, { next: { revalidate: 60 } } as any);
}

export async function getProduct(slug: string) {
  return api.get<any>(`/products/${slug}`, { next: { revalidate: 60 } } as any);
}

export async function getCategories(homeOnly = false) {
  const query = homeOnly ? '?homeOnly=true' : '';
  return api.get<any>(`/categories${query}`, { next: { revalidate: 300 } } as any);
}

export async function getBanners() {
  return api.get<any>('/banners', { next: { revalidate: 300 } } as any);
}

export async function getSettings() {
  return api.get<any>('/settings', { next: { revalidate: 300 } } as any);
}

export async function getHomepageSections() {
  return api.get<any>('/settings/homepage-sections', { next: { revalidate: 300 } } as any);
}

export async function validateCoupon(code: string, subtotal: number) {
  return api.post<any>('/coupons/validate', { code, subtotal });
}
