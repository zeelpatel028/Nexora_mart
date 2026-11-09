/**
 * Navigation Types & Screen Param Lists
 * Strictly typed for React Navigation v6 Native Stack & Bottom Tabs
 */
import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

export type MainTabParamList = {
  DashboardTab: undefined;
  CustomerTab: undefined;
  PosTab: undefined;
  ProductsTab: undefined;
  MoreTab: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;

  // Product Screens
  ProductList: undefined;
  ProductDetail: { productId: number };
  ProductDetails?: { productId: number };
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
  Sales?: undefined;
  SaleDetail: { saleId: number };

  // Purchase Screens
  PurchaseList: undefined;
  Purchases?: undefined;
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

export type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavProp = BottomTabNavigationProp<MainTabParamList>;

