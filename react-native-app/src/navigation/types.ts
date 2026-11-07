/**
 * Navigation Types & Screen Param Lists
 */
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: undefined;

  // Product Screens
  ProductList: undefined;
  ProductDetail: { productId: number };
  AddProduct: { categoryId?: number };
  EditProduct: { productId: number };

  // Category Screens
  CategoryManager: undefined;

  // Inventory Screens
  Inventory: undefined;
  StockInward: { productId?: number };
  StockAdjustment: { productId?: number };
  ExpiryAlerts: undefined;

  // Orders & POS Screens
  PosBilling: undefined;
  SalesList: undefined;
  SaleDetail: { saleId: number };

  // Purchase Screens
  PurchaseList: undefined;
  CreatePurchase: undefined;

  // Partner Screens
  CustomerList: undefined;
  SupplierList: undefined;

  // Reports & Analytics
  Reports: undefined;
  InventoryValuation: undefined;

  // Finance
  Finance: undefined;

  // Profile & Settings
  Profile: undefined;
  Settings: undefined;
  AccountDetail: undefined;
};

export type MainTabParamList = {
  DashboardTab: undefined;
  ProductsTab: undefined;
  PosTab: undefined;
  InventoryTab: undefined;
  MoreTab: undefined;
};

