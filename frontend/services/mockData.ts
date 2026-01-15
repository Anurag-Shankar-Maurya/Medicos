import { Medicine, Batch, DashboardStats, User, Sale, SaleItem } from '../types';

export const MOCK_USER: User = {
  id: 1,
  username: 'admin',
  email: 'admin@medicos.local',
  first_name: 'Dr. John',
  last_name: 'Doe',
  role: 'admin',
  is_active: true
};

export const MOCK_MEDICINES: Medicine[] = [
  {
    id: 1,
    name: 'Paracetamol',
    generic_name: 'Acetaminophen',
    medicine_type: 'tablet',
    manufacturer: 'GSK',
    strength: '500mg',
    pack_size: '10s',
    mrp: '20.00',
    selling_price: '18.00',
    quantity_in_stock: 450,
    low_stock_threshold: 100,
    requires_prescription: false,
    rack_number: 'A-12',
    needs_reorder: 'false'
  },
  {
    id: 2,
    name: 'Amoxicillin',
    generic_name: 'Amoxicillin',
    medicine_type: 'capsule',
    manufacturer: 'Sun Pharma',
    strength: '250mg',
    pack_size: '10s',
    mrp: '55.00',
    selling_price: '45.00',
    quantity_in_stock: 45,
    low_stock_threshold: 50,
    requires_prescription: true,
    rack_number: 'B-05',
    needs_reorder: 'true'
  },
  {
    id: 3,
    name: 'Cetirizine',
    generic_name: 'Cetirizine HCl',
    medicine_type: 'tablet',
    manufacturer: 'Cipla',
    strength: '10mg',
    pack_size: '15s',
    mrp: '30.00',
    selling_price: '25.00',
    quantity_in_stock: 200,
    low_stock_threshold: 50,
    requires_prescription: false,
    rack_number: 'A-15',
    needs_reorder: 'false'
  },
  {
    id: 4,
    name: 'Azithromycin',
    generic_name: 'Azithromycin',
    medicine_type: 'tablet',
    manufacturer: 'Lupin',
    strength: '500mg',
    pack_size: '3s',
    mrp: '70.00',
    selling_price: '60.00',
    quantity_in_stock: 120,
    low_stock_threshold: 30,
    requires_prescription: true,
    rack_number: 'B-06',
    needs_reorder: 'false'
  },
  {
    id: 5,
    name: 'Pantoprazole',
    generic_name: 'Pantoprazole',
    medicine_type: 'tablet',
    manufacturer: 'Alkem',
    strength: '40mg',
    pack_size: '10s',
    mrp: '90.00',
    selling_price: '80.00',
    quantity_in_stock: 300,
    low_stock_threshold: 60,
    requires_prescription: false,
    rack_number: 'C-01',
    needs_reorder: 'false'
  },
  {
    id: 6,
    name: 'Metformin',
    generic_name: 'Metformin HCl',
    medicine_type: 'tablet',
    manufacturer: 'USV',
    strength: '500mg',
    pack_size: '10s',
    mrp: '25.00',
    selling_price: '22.00',
    quantity_in_stock: 10,
    low_stock_threshold: 50,
    requires_prescription: true,
    rack_number: 'D-10',
    needs_reorder: 'true'
  }
];

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  totalSales: 15430,
  lowStockCount: 23,
  expiringSoonCount: 12,
  todaysRevenue: 15430
};

export const MOCK_SALES_CHART_DATA = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export const MOCK_RECENT_SALES: Sale[] = [
  {
    id: 101,
    invoice_number: 'INV-2023-001',
    customer_name: 'Alice Smith',
    sale_date: new Date().toISOString(),
    total_amount: '125.00',
    payment_method: 'cash',
    items: []
  },
  {
    id: 102,
    invoice_number: 'INV-2023-002',
    customer_name: 'Bob Jones',
    sale_date: new Date(Date.now() - 86400000).toISOString(),
    total_amount: '450.50',
    payment_method: 'card',
    items: []
  }
];
