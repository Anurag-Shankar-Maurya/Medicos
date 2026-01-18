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
  employee_id?: string;
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
  supplier: number | null;
  supplier_name: string | null;
  composition: string;
  strength: string;
  pack_size: string;
  purchase_price: string;
  mrp: string;
  selling_price: string;
  wholesale_price: string;
  gst_percentage: number;
  hsn_code: string;
  quantity_in_stock: number;
  reorder_level: number;
  max_stock_level: number;
  rack_number: string;
  shelf_number: string;
  requires_prescription: boolean;
  is_schedule_h: boolean;
  is_schedule_x: boolean;
  side_effects: string;
  usage_instructions: string;
  barcode: string;
  sku: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string | null;
  profit_margin: number;
  needs_reorder: boolean;
  is_overstocked: boolean;
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
  customer_contact?: string;
  doctor_name?: string;
  doctor_registration?: string;
  prescription_number?: string;
  prescription_image?: string;
  subtotal: string;
  tax_amount: string;
  discount: string;
  total_amount: string;
  payment_method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'insurance';
  amount_paid: string;
  change_returned: string;
  points_earned: number;
  points_redeemed: number;
  notes?: string;
  sale_date: string;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string | null;
  items: any[]; // SaleItemSerializer
}

// Notifications
export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'new_sale' | 'system';
  priority: 'low' | 'medium' | 'high' | 'critical';
  medicine?: number;
  medicine_name?: string;
  sale?: number;
  sale_invoice?: string;
  user: number;
  is_read: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  read_at?: string;
}

// Stats for Dashboard
export interface DashboardStats {
  sales_summary: {
    todaysRevenue: number;
    todaysTransactions: number;
    totalLifetimeSales: number;
    averageOrderValue: number;
  };
  inventory_summary: {
    totalProducts: number;
    lowStockCount: number;
    outOfStockCount: number;
    expiringSoonCount: number;
    inventoryCostValue: number;
    inventoryPotentialValue: number;
    estimatedPotentialProfit: number;
    averageProfitMargin: number;
    inventoryTurnoverRatio: number;
  };
  alerts_summary: {
    unreadNotifications: number;
  };
  payment_analytics: Array<{
    payment_method: string;
    total: number;
    count: number;
  }>;
}

// Additional dashboard interfaces
export interface TopSellingProduct {
  medicine__name: string;
  medicine__medicine_type: string;
  total_qty: number;
  total_revenue: number;
}

export interface RecentTransaction {
  id: number;
  invoice: string;
  customer: string;
  amount: number;
  time: string;
  status: string;
}

export interface ChartDataPoint {
  name: string;
  date: string;
  sales: number;
  orders: number;
}
