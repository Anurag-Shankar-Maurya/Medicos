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
  medicine_type: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'ointment' | 'drops' | 'cream' | 'gel' | 'powder' | 'inhaler' | 'other';
  manufacturer: string;
  strength: string;
  pack_size: string;
  mrp: string;
  selling_price: string;
  quantity_in_stock: number;
  low_stock_threshold: number;
  requires_prescription: boolean;
  rack_number: string;
  needs_reorder?: string; // from backend logic
  expiry_date?: string; // derived from batches usually, but simplified here
}

export interface Batch {
  id: number;
  medicine: number;
  medicine_name: string;
  batch_number: string;
  expiry_date: string;
  quantity: number;
  is_expired: string; // boolean as string in swagger? Assuming "true"/"false" or check definition
  days_to_expiry: string;
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