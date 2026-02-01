/**
 * API client for communicating with the FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_avatar: string | null;
  order_date: string;
  status: 'Pending' | 'Completed' | 'Refunded';
  total_amount: number;
  payment_status: 'Paid' | 'Unpaid';
  created_at: string;
  updated_at: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface OrderStats {
  total_this_month: number;
  pending: number;
  shipped: number;
  refunded: number;
}

export interface OrderFilters {
  page?: number;
  per_page?: number;
  status?: 'Pending' | 'Completed' | 'Refunded';
  payment_status?: 'Paid' | 'Unpaid';
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Orders endpoints
  async getOrders(filters: OrderFilters = {}): Promise<OrderListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    
    return this.request<OrderListResponse>(endpoint);
  }

  async getOrder(id: number): Promise<Order> {
    return this.request<Order>(`/orders/${id}`);
  }

  async createOrder(order: Partial<Order>): Promise<Order> {
    return this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id: number, order: Partial<Order>): Promise<Order> {
    return this.request<Order>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  }

  async deleteOrder(id: number): Promise<void> {
    return this.request<void>(`/orders/${id}`, {
      method: 'DELETE',
    });
  }

  // Bulk operations
  async bulkUpdateStatus(
    orderIds: number[],
    status: 'Pending' | 'Completed' | 'Refunded'
  ): Promise<{ message: string; updated_count: number }> {
    return this.request('/orders/bulk/status', {
      method: 'PUT',
      body: JSON.stringify({ order_ids: orderIds, status }),
    });
  }

  async bulkDuplicate(
    orderIds: number[]
  ): Promise<{ message: string; duplicated_count: number; new_ids: number[] }> {
    return this.request('/orders/bulk/duplicate', {
      method: 'POST',
      body: JSON.stringify({ order_ids: orderIds }),
    });
  }

  async bulkDelete(
    orderIds: number[]
  ): Promise<{ message: string; deleted_count: number }> {
    return this.request('/orders/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ order_ids: orderIds }),
    });
  }

  // Statistics
  async getOrderStats(): Promise<OrderStats> {
    return this.request<OrderStats>('/orders/stats/summary');
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health');
  }
}

export const api = new ApiClient();
