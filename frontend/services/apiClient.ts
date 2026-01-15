import { LoginResponse, PaginatedResponse } from '../types';
import { MOCK_USER, MOCK_MEDICINES, MOCK_DASHBOARD_STATS, MOCK_SALES_CHART_DATA, MOCK_RECENT_SALES } from './mockData';

const BASE_URL = 'http://127.0.0.1:8000/api';
const USE_MOCK = true; // Flag to toggle mock data. In production, this might be false or environment driven.

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // --- Mock Request Handler ---
  private async mockRequest<T>(endpoint: string, method: string, body?: any): Promise<T> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log(`[MOCK API] ${method} ${endpoint}`, body);

        // Login
        if (endpoint === '/users/auth/login/' && method === 'POST') {
           if (body?.username && body?.password) {
             resolve({
                token: 'mock-jwt-token-xyz',
                user: MOCK_USER
             } as any);
           } else {
             reject(new Error('Invalid credentials'));
           }
           return;
        }

        // Dashboard
        if (endpoint === '/dashboard/stats/' && method === 'GET') {
          resolve(MOCK_DASHBOARD_STATS as any);
          return;
        }

        if (endpoint === '/dashboard/sales-chart/' && method === 'GET') {
          resolve(MOCK_SALES_CHART_DATA as any);
          return;
        }

        // Medicines List with Pagination Search
        if (endpoint.startsWith('/medicines/medicines/') && method === 'GET') {
           const url = new URL(`http://dummy${endpoint}`);
           const page = parseInt(url.searchParams.get('page') || '1');
           const search = url.searchParams.get('search') || '';
           
           let results = MOCK_MEDICINES.filter(m => 
              m.name.toLowerCase().includes(search.toLowerCase()) || 
              m.generic_name.toLowerCase().includes(search.toLowerCase())
           );
           
           // Simple Pagination Logic
           const pageSize = 10;
           const count = results.length;
           const start = (page - 1) * pageSize;
           const end = start + pageSize;
           const sliced = results.slice(start, end);

           const response: PaginatedResponse<any> = {
             count,
             next: end < count ? `?page=${page+1}` : null,
             previous: page > 1 ? `?page=${page-1}` : null,
             results: sliced
           };
           resolve(response as any);
           return;
        }
        
        // Recent Sales
        if (endpoint.startsWith('/medicines/sales/') && method === 'GET') {
            resolve({
                count: MOCK_RECENT_SALES.length,
                next: null,
                previous: null,
                results: MOCK_RECENT_SALES
            } as any);
            return;
        }

        reject(new Error(`Mock endpoint not found: ${endpoint}`));
      }, 600); // Simulate 600ms latency
    });
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    if (USE_MOCK) {
       // Parse body if it exists for the mock handler
       const body = options.body ? JSON.parse(options.body as string) : undefined;
       return this.mockRequest<T>(endpoint, options.method || 'GET', body);
    }

    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
            localStorage.removeItem('auth_token');
            window.location.hash = '#/login';
            throw new Error('Session expired. Please login again.');
        }
        if (response.status === 403) throw new Error('You do not have permission to perform this action.');
        if (response.status === 404) throw new Error('Resource not found.');
        if (response.status >= 500) throw new Error('Server error. Please try again later.');
        
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || errData.message || `API Error: ${response.statusText}`);
      }

      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Request Failed:', error);
      throw error; // Re-throw to be caught by React components
    }
  }

  get<T>(endpoint: string, params?: Record<string, string>) {
    let url = endpoint;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();