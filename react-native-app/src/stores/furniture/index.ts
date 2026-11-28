import React from 'react';

export const storeType = 'furniture' as const;

export function getScreen(name: string): React.ComponentType<any> {
  switch (name) {
    case 'Splash':
      return require('./screens/auth/SplashScreen').default;
    case 'Login':
      return require('./screens/auth/LoginScreen').default;
    case 'Register':
      return require('./screens/auth/RegisterScreen').default;
    case 'ForgotPassword':
      return require('./screens/auth/ForgotPasswordScreen').default;
    case 'DashboardTab':
      return require('./screens/dashboard/DashboardScreen').default;
    case 'CustomerTab':
    case 'CustomerList':
    case 'Khata':
      return require('./screens/customers/KhataScreen').default;
    case 'CustomerDetail':
      return require('./screens/customers/CustomerDetailScreen').default;
    case 'PosTab':
    case 'PosBilling':
      return require('./screens/billing/PosBillingScreen').default;
    case 'SalesList':
      return require('./screens/billing/SalesListScreen').default;
    case 'SaleDetail':
      return require('./screens/billing/SaleDetailScreen').default;
    case 'Invoice':
      return require('./screens/billing/InvoiceScreen').default;
    case 'ProductsTab':
    case 'ProductList':
      return require('./screens/products/ProductInventoryScreen').default;
    case 'Inventory':
      return require('./screens/products/ProductInventoryScreen').default;
    case 'ProductDetail':
      return require('./screens/products/ProductDetailScreen').default;
    case 'AddProduct':
      return require('./screens/products/FurnitureAddProductScreen').default;
    case 'EditProduct':
      return require('./screens/products/FurnitureEditProductScreen').default;
    case 'MoreTab':
      return require('./screens/dashboard/MoreMenuScreen').default;
    case 'SupplierList':
    case 'AddSupplier':
      return require('./screens/suppliers/SupplierListScreen').default;
    case 'SupplierDetail':
      return require('./screens/suppliers/SupplierDetailScreen').default;
    case 'PurchaseList':
      return require('./screens/suppliers/PurchaseListScreen').default;
    case 'PurchaseOrder':
      return require('./screens/suppliers/PurchaseOrderScreen').default;
    case 'CreatePurchase':
      return require('./screens/suppliers/CreatePurchaseScreen').default;
    case 'Reports':
      return require('./screens/reports/ReportsScreen').default;
    case 'InventoryValuation':
      return require('./screens/reports/InventoryValuationScreen').default;
    case 'Finance':
      return require('./screens/expenses/FinanceScreen').default;
    case 'Profile':
      return require('./screens/account/ProfileScreen').default;
    case 'AccountDetail':
      return require('./screens/account/AccountDetailScreen').default;
    case 'Settings':
      return require('./screens/settings/SettingsScreen').default;
    case 'PrivacyPolicy':
      return require('./screens/settings/PrivacyPolicyScreen').default;
    default:
      return require('./screens/dashboard/DashboardScreen').default;
  }
}

export default { storeType, getScreen };
