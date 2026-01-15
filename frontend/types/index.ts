// API Response Wrappers
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// User & Auth
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'pharmacist' | 'cashier' | 'manager';
  is_active: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Inventory
export interface Medicine {
  id: number;
  name: string;
  generic_name: string;
  medicine_type: string;
  manufacturer: string;
  strength: string;
  pack_size: string;
  mrp: string;
  selling_price: string;
  quantity_in_stock: number;
  reorder_level: number;
  requires_prescription: boolean;
  rack_number: string;
  needs_reorder: boolean; 
  is_overstocked: boolean;
  created_at: string;
}

export interface Batch {
  id: number;
  medicine: number;
  medicine_name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  is_expired: boolean;
  is_near_expiry: boolean;
  days_to_expiry: number;
}

// Sales
export interface SaleItem {
  medicine_id: number;
  quantity: number;
  price: number;
  batch_id: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  customer_name: string;
  sale_date: string;
  total_amount: string;
  payment_method: 'cash' | 'card' | 'upi';
  items: SaleItem[];
}

// Stats for Dashboard
export interface DashboardStats {
  totalSales: number;
  lowStockCount: number;
  expiringSoonCount: number;
  todaysRevenue: number;
}