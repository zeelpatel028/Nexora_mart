import React from 'react';

export const storeType = 'grocery' as const;

export function getScreen(name: string): React.ComponentType<any> {
  switch (name) {
    case 'Splash':
      return require('./grocery_account/SplashScreen').default;
    case 'Login':
      return require('./grocery_account/LoginScreen').default;
    case 'Register':
      return require('./grocery_account/RegisterScreen').default;
    case 'ForgotPassword':
      return require('./grocery_account/ForgotPasswordScreen').default;
    case 'DashboardTab':
      return require('./grocery_dashboard/DashboardScreen').default;
    case 'CustomerTab':
    case 'CustomerList':
    case 'Khata':
      return require('./grocery_customer/KhataScreen').default;
    case 'CustomerDetail':
      return require('./grocery_customer_details/CustomerDetailScreen').default;
    case 'PosTab':
    case 'PosBilling':
      return require('./grocery_make_bill/PosBillingScreen').default;
    case 'SalesList':
      return require('./grocery_make_bill/SalesListScreen').default;
    case 'SaleDetail':
      return require('./grocery_make_bill/SaleDetailScreen').default;
    case 'Invoice':
      return require('./grocery_invoice/InvoiceScreen').default;
    case 'ProductsTab':
    case 'ProductList':
    case 'Inventory':
      return require('./grocery_product/ProductInventoryScreen').default;
    case 'ProductDetail':
      return require('./grocery_product/ProductDetailScreen').default;
    case 'AddProduct':
      return require('./grocery_add_product/GroceryAddProductScreen').default;
    case 'EditProduct':
      return require('./grocery_edit_product/GroceryEditProductScreen').default;
    case 'MoreTab':
      return require('./grocery_dashboard/MoreMenuScreen').default;
    case 'SupplierList':
    case 'AddSupplier':
      return require('./grocery_supplier/SupplierListScreen').default;
    case 'SupplierDetail':
      return require('./grocery_supplier/SupplierDetailScreen').default;
    case 'PurchaseList':
      return require('./grocery_order/PurchaseListScreen').default;
    case 'PurchaseOrder':
      return require('./grocery_order/PurchaseOrderScreen').default;
    case 'CreatePurchase':
      return require('./grocery_add_order/CreatePurchaseScreen').default;
    case 'Reports':
      return require('./grocery_reports/ReportsScreen').default;
    case 'InventoryValuation':
      return require('./grocery_reports/InventoryValuationScreen').default;
    case 'Finance':
      return require('./grocery_expense/FinanceScreen').default;
    case 'Profile':
      return require('./grocery_account/ProfileScreen').default;
    case 'AccountDetail':
      return require('./grocery_account/AccountDetailScreen').default;
    case 'Settings':
      return require('./grocery_settings/SettingsScreen').default;
    case 'PrivacyPolicy':
      return require('./grocery_settings/PrivacyPolicyScreen').default;
    default:
      return require('./grocery_dashboard/DashboardScreen').default;
  }
}

export default { storeType, getScreen };
