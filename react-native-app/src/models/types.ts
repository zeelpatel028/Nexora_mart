/**
 * TypeScript Data Models & Schemas
 * Matched with FastAPI backend schemas and SQLite models
 */

// ========================
// AUTH & USER
// ========================
export interface User {
  id: number;
  email: string;
  first_name?: string;
  firstName?: string;
  surname?: string;
  name?: string;
  phone?: string;
  store_type?: string;
  storeType?: string;
  is_active?: boolean;
  isActive?: boolean;
  created_at?: string;
}

export interface StoreType {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  is_active: boolean;
}

export interface AuthResponse {
  token: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user: User;
  store?: Store | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name?: string;
  firstName?: string;
  surname?: string;
  email: string;
  phone?: string;
  storeType?: string;
  store_type_id?: number;
  store_type_code?: string;
  store_name?: string;
  password: string;
}

// ========================
// STORE
// ========================
export interface Store {
  id: number;
  user_id: number;
  name: string;
  category_id?: number | null;
  category?: Category | null;
  store_type_id?: number | null;
  store_type?: StoreType | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  tax_number?: string | null;
  currency?: string;
  created_at?: string;
}

export interface StoreUpdatePayload {
  name?: string;
  category_id?: number;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  tax_number?: string;
  currency?: string;
}

// ========================
// CATEGORY & DYNAMIC FIELDS
// ========================
export interface CategoryField {
  id: number;
  category_id: number;
  field_name: string;
  label: string;
  field_type: 'text' | 'number' | 'select' | 'date' | 'boolean';
  is_required: boolean;
  options?: string[] | null;
  default_value?: string | null;
  display_order: number;
}

export interface Category {
  id: number;
  name: string;
  code: string;
  description?: string | null;
  icon?: string | null;
  is_active: boolean;
  fields?: CategoryField[];
}

// ========================
// PRODUCT & VARIANTS
// ========================
// ========================
// BRANDS
// ========================
export interface Brand {
  id: number;
  store_id: number;
  name: string;
  code?: string | null;
  description?: string | null;
  logo_url?: string | null;
  is_active: boolean;
}

// ========================
// PRODUCT & VARIANTS
// ========================
export interface ProductPricing {
  id?: number;
  purchase_price?: number;
  selling_price: number;
  mrp?: number | null;
  wholesale_price?: number | null;
  tax_type?: 'exclusive' | 'inclusive' | 'exempt';
  gst_rate?: number;
  cgst_rate?: number;
  sgst_rate?: number;
  igst_rate?: number;
}

export interface ProductInventory {
  id?: number;
  opening_stock?: number;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  reorder_level?: number;
  warehouse_location?: string | null;
}

export interface ProductBatch {
  id?: number;
  batch_number: string;
  manufacturing_date?: string | null;
  expiry_date?: string | null;
  initial_quantity?: number;
  current_quantity: number;
  purchase_price?: number;
  selling_price?: number;
  mrp?: number;
  is_active?: boolean;
}

export interface ProductAlert {
  id?: number;
  alert_type: 'low_stock' | 'expiring_soon' | 'out_of_stock';
  threshold_value?: number;
  alert_days_before?: number;
  is_enabled: boolean;
  notify_email?: boolean;
  notify_sms?: boolean;
}

export interface ProductVariant {
  id?: number;
  product_id?: string | number;
  variant_name?: string;
  sku: string;
  barcode?: string;
  attributes?: Record<string, any>;
  price?: number;
  selling_price?: number;
  purchase_price?: number;
  mrp?: number;
  stock?: number;
  stock_quantity?: number;
  inventory?: { quantity: number };
  is_active?: boolean;
}

export interface Product {
  id: string | number;
  store_id: number;
  category_id?: number | null;
  brand_id?: number | null;
  unit_id?: number | null;
  category_name?: string | null;
  category_code?: string | null;
  category?: Category | null;
  brand?: Brand | null;
  product_name?: string;
  name: string;
  product_code?: string | null;
  sku: string;
  barcode?: string | null;
  hsn_code?: string | null;
  short_description?: string | null;
  description?: string | null;
  image_url?: string | null;
  purchase_price: number;
  selling_price: number;
  mrp?: number | null;
  unit: string;
  min_stock_level: number;
  status?: string;
  is_active: boolean;
  is_featured?: boolean;
  has_variants: boolean;
  attributes: Record<string, any>;
  current_stock: number;
  pricing?: ProductPricing | null;
  inventory_record?: ProductInventory | null;
  variants?: ProductVariant[];
  batches?: ProductBatch[];
  alerts?: ProductAlert[];
  grocery_details?: Record<string, any>;
  clothing_details?: Record<string, any>;
  medicine_details?: Record<string, any>;
  electronics_details?: Record<string, any>;
  plastic_details?: Record<string, any>;
  handloom_details?: Record<string, any>;
  furniture_details?: Record<string, any>;
  agro_details?: Record<string, any>;
  store_details?: Record<string, any>;
  created_at?: string;
}

export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'date' | 'textarea';
  required?: boolean;
  placeholder?: string;
  default?: any;
  options?: string[];
}

export interface FormConfigResponse {
  store: {
    id: number;
    name: string;
    code: string;
    store_type: string;
    store_type_code: string;
  };
  store_type: {
    code: string;
    name: string;
    has_variants: boolean;
    has_batches: boolean;
    has_serials: boolean;
  };
  common_fields: Record<string, any>;
  store_specific_fields: FormFieldConfig[];
  categories: Array<{ id: number; name: string; code?: string; icon?: string }>;
  brands: Array<{ id: number; name: string; code?: string }>;
  units: Array<{ id: number; name: string; symbol: string }>;
}

export interface ProductCreatePayload {
  product_name?: string;
  name?: string;
  product_code?: string;
  category_id?: number;
  brand_id?: number;
  unit_id?: number;
  sku?: string;
  barcode?: string;
  hsn_code?: string;
  short_description?: string;
  description?: string;
  image_url?: string;
  purchase_price?: number;
  selling_price: number;
  mrp?: number;
  unit?: string;
  min_stock_level?: number;
  initial_stock?: number;
  current_stock?: number;
  product_type?: string;
  status?: string;
  is_featured?: boolean;
  has_variants?: boolean;
  pricing?: {
    purchase_price?: number;
    selling_price: number;
    mrp?: number;
    wholesale_price?: number;
    tax_type?: string;
    gst_rate?: number;
  };
  inventory?: {
    opening_stock?: number;
    current_stock?: number;
    minimum_stock?: number;
    maximum_stock?: number;
    reorder_level?: number;
    warehouse_location?: string;
  };
  store_details?: Record<string, any>;
  grocery_details?: Record<string, any>;
  clothing_details?: Record<string, any>;
  medicine_details?: Record<string, any>;
  electronics_details?: Record<string, any>;
  plastic_details?: Record<string, any>;
  handloom_details?: Record<string, any>;
  furniture_details?: Record<string, any>;
  agro_details?: Record<string, any>;
  attributes?: Record<string, any>;
  variants?: Array<{
    variant_name?: string;
    sku: string;
    barcode?: string;
    purchase_price?: number;
    selling_price: number;
    mrp?: number;
    stock_quantity?: number;
    initial_stock?: number;
    is_active?: boolean;
    attributes?: Record<string, any>;
  }>;
  batches?: Array<{
    batch_number: string;
    manufacturing_date?: string;
    expiry_date?: string;
    purchase_price?: number;
    selling_price?: number;
    mrp?: number;
    initial_quantity?: number;
    current_quantity?: number;
    is_active?: boolean;
  }>;
  alerts?: Array<{
    alert_type: string;
    threshold_value?: number;
    alert_days_before?: number;
    is_enabled: boolean;
    notify_email?: boolean;
    notify_sms?: boolean;
  }>;
  images?: Array<{
    image_url: string;
    is_primary?: boolean;
  }>;
}

export interface ProductUpdatePayload {
  product_name?: string;
  name?: string;
  product_code?: string;
  category_id?: number;
  brand_id?: number;
  unit_id?: number;
  sku?: string;
  barcode?: string;
  hsn_code?: string;
  short_description?: string;
  description?: string;
  image_url?: string;
  purchase_price?: number;
  selling_price?: number;
  mrp?: number;
  unit?: string;
  min_stock_level?: number;
  current_stock?: number;
  status?: string;
  is_active?: boolean;
  is_featured?: boolean;
  pricing?: {
    purchase_price?: number;
    selling_price?: number;
    mrp?: number;
    wholesale_price?: number;
    tax_type?: string;
    gst_rate?: number;
  };
  inventory?: {
    current_stock?: number;
    minimum_stock?: number;
    maximum_stock?: number;
    reorder_level?: number;
    warehouse_location?: string;
  };
  store_details?: Record<string, any>;
  grocery_details?: Record<string, any>;
  clothing_details?: Record<string, any>;
  medicine_details?: Record<string, any>;
  electronics_details?: Record<string, any>;
  plastic_details?: Record<string, any>;
  handloom_details?: Record<string, any>;
  furniture_details?: Record<string, any>;
  agro_details?: Record<string, any>;
  attributes?: Record<string, any>;
}

// ========================
// INVENTORY
// ========================
export interface InventoryItem {
  id: number;
  product_id: number;
  product_name: string;
  sku: string;
  unit: string;
  quantity: number;
  min_stock_level: number;
  batch_number?: string | null;
  expiry_date?: string | null;
  is_low_stock?: boolean;
  is_expired?: boolean;
  is_expiring_soon?: boolean;
}

export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  movement_type: 'IN' | 'OUT' | 'ADJUST' | 'SALE' | 'PURCHASE';
  quantity: number;
  quantity_before?: number;
  quantity_after?: number;
  reason?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface StockInPayload {
  product_id: string | number;
  quantity: number;
  unit_cost?: number;
  batch_number?: string;
  expiry_date?: string;
  notes?: string;
}

export interface StockOutPayload {
  product_id: string | number;
  quantity: number;
  reason: string;
  notes?: string;
}

export interface StockAdjustPayload {
  product_id: string | number;
  physical_count: number;
  reason: string;
  notes?: string;
}

// ========================
// SALES / ORDERS / POS
// ========================
export interface SaleItem {
  id?: number;
  sale_id?: number;
  product_id: string | number;
  product_name?: string;
  sku?: string;
  unit?: string;
  quantity: number;
  unit_price: number;
  discount?: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  invoice_number: string;
  store_id: number;
  customer_id?: number | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  paid_amount: number;
  payment_method: string;
  payment_status: string;
  items?: SaleItem[];
  created_at: string;
}

export interface SaleCreatePayload {
  customer_id?: number | null;
  payment_method: string;
  discount_amount?: number;
  tax_amount?: number;
  paid_amount?: number;
  items: Array<{
    product_id: string | number;
    quantity: number;
    unit_price: number;
    discount?: number;
  }>;
}

// ========================
// PURCHASES
// ========================
export interface PurchaseItem {
  id?: number;
  purchase_id?: number;
  product_id: string | number;
  product_name?: string;
  sku?: string;
  quantity: number;
  unit_cost: number;
  batch_number?: string | null;
  expiry_date?: string | null;
  subtotal: number;
}

export interface Purchase {
  id: number;
  invoice_number: string;
  store_id: number;
  supplier_id?: number | null;
  supplier_name?: string | null;
  total_amount: number;
  paid_amount: number;
  payment_method: string;
  payment_status: string;
  items?: PurchaseItem[];
  created_at: string;
}

export interface PurchaseCreatePayload {
  supplier_id: number;
  invoice_number?: string;
  payment_method: string;
  paid_amount?: number;
  items: Array<{
    product_id: string | number;
    quantity: number;
    unit_cost: number;
    batch_number?: string;
    expiry_date?: string;
  }>;
}

// ========================
// PARTNERS (Customers & Suppliers)
// ========================
export interface Customer {
  id: number;
  store_id: number;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gst_number?: string | null;
  credit_limit: number;
  balance: number;
  is_active: boolean;
  created_at?: string;
}

export interface Supplier {
  id: number;
  store_id: number;
  name: string;
  company_name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  gst_number?: string | null;
  balance: number;
  is_active: boolean;
  created_at?: string;
}

// ========================
// FINANCE & EXPENSES
// ========================
export interface Expense {
  id: number;
  store_id: number;
  category: string;
  amount: number;
  payment_method: string;
  expense_date: string;
  description?: string | null;
  receipt_url?: string | null;
}

export interface Payment {
  id: number;
  store_id: number;
  reference_type: 'SALE' | 'PURCHASE' | 'EXPENSE' | 'CUSTOMER_CREDIT' | 'SUPPLIER_PAY';
  reference_id?: number | null;
  amount: number;
  payment_method: string;
  payment_date: string;
  notes?: string | null;
}

// ========================
// REPORTS
// ========================
export interface DashboardSummary {
  store_id: number;
  store_name: string;
  category_name?: string;
  total_sales: number;
  today_sales: number;
  total_orders: number;
  active_products: number;
  low_stock_count: number;
  inventory_value: number;
  estimated_profit?: number;
}

export interface SalesAnalytics {
  days: number;
  daily_trends: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  total_sales: number;
  total_orders: number;
}

export interface CategoryPerformance {
  categories: Array<{
    category_id: number;
    name: string;
    icon?: string;
    total_sales: number;
    items_sold: number;
  }>;
}

export interface InventoryValuation {
  total_items: number;
  total_units: number;
  total_cost_value: number;
  total_retail_value: number;
  potential_margin_value: number;
  margin_percentage: number;
}

// ========================
// UNITS
// ========================
export interface Unit {
  id: number;
  name: string;
  symbol: string;
  is_base_unit?: boolean;
}

// ========================
// ANALYTICS DASHBOARD
// ========================
export interface AnalyticsStatCard {
  id: string;
  title: string;
  value: string;
  trend?: string;
  is_positive?: boolean;
  subtitle?: string;
  color_scheme: 'orange' | 'red' | 'blue' | 'green';
}

export interface SalesChartPoint {
  day: string;
  sales: number;
  orders: number;
}

export interface CategorySalesSegment {
  name: string;
  percentage: number;
  color: string;
  sales?: number;
}

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  icon: string;
}

export interface LowStockProduct {
  id: number;
  name: string;
  stock: string;
  status: string;
  status_color: 'danger' | 'warning';
  category?: string;
}

export interface AnalyticsOverview {
  store_name: string;
  greeting: string;
  date_display: string;
  stats: AnalyticsStatCard[];
  sales_overview: SalesChartPoint[];
  category_sales: CategorySalesSegment[];
  category_total_sales: string;
  recent_activities: RecentActivity[];
  low_stock_products: LowStockProduct[];
}

export interface ReturnItemPayload {
  product_id: string;
  quantity: number;
  unit_price?: number;
  condition_note?: string;
}

export interface ReturnCreatePayload {
  invoice_id: number;
  items: ReturnItemPayload[];
  reason?: string;
  refund_method?: string;
}

export interface ReturnItem {
  id: number;
  return_id: number;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  condition_note?: string;
  product?: Product;
}

export interface SalesReturn {
  id: number;
  return_number: string;
  invoice_id: number;
  store_id: number;
  total_refund_amount: number;
  refund_method: string;
  reason?: string;
  status: string;
  created_at: string;
  items: ReturnItem[];
}



