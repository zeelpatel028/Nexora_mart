/**
 * Navigation Types & Screen Param Lists
 * Strictly typed for React Navigation v6 Native Stack & Bottom Tabs
 */
import { NavigatorScreenParams, CompositeNavigationProp } from '@react-navigation/native';
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
  ProductDetail: { productId: string | number };
  AddProduct?: { categoryId?: number };
  EditProduct: { productId: string | number };

  // Inventory Screens
  Inventory: undefined;
  StockAdjustment?: { productId?: string | number };
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

export type RootStackNavProp = NativeStackNavigationProp<RootStackParamList>;
export type MainTabNavProp = BottomTabNavigationProp<MainTabParamList>;

/**
 * Composite Navigation Props for screens housed inside MainTabs
 * Enables type-safe navigation to sibling tabs as well as root stack screens
 */
export type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'DashboardTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type MoreScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'MoreTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type PosScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'PosTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type ProductsScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'ProductsTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export type CustomersScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'CustomerTab'>,
  NativeStackNavigationProp<RootStackParamList>
>;

