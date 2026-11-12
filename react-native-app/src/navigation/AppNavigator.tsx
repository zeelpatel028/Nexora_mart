/**
 * Complete Native Mobile Navigation
 * Native Stack & Bottom Tab Navigation (NO WebView)
 */
import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList, MainTabParamList } from './types';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

// Modern SVG Lucide Icons
import {
  HomeIcon,
  UsersIcon,
  ReceiptIcon,
  PackageIcon,
  GridIcon,
} from '../components/branding/Icons';

// Auth Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

// Core Screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import MoreMenuScreen from '../screens/dashboard/MoreMenuScreen';
import ProductListScreen from '../screens/products/ProductListScreen';
import ProductDetailScreen from '../screens/products/ProductDetailScreen';
import AddProductScreen from '../screens/products/AddProductScreen';
import EditProductScreen from '../screens/products/EditProductScreen';
import InventoryScreen from '../screens/inventory/InventoryScreen';
import StockAdjustmentScreen from '../screens/inventory/StockAdjustmentScreen';
import PosBillingScreen from '../screens/orders/PosBillingScreen';
import SalesListScreen from '../screens/orders/SalesListScreen';
import SaleDetailScreen from '../screens/orders/SaleDetailScreen';
import PurchaseListScreen from '../screens/purchases/PurchaseListScreen';
import CreatePurchaseScreen from '../screens/purchases/CreatePurchaseScreen';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import SupplierListScreen from '../screens/suppliers/SupplierListScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';
import InventoryValuationScreen from '../screens/reports/InventoryValuationScreen';
import FinanceScreen from '../screens/payments/FinanceScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';
import AccountDetailScreen from '../screens/account/AccountDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => {
  const { colors, brandColors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      backBehavior="initialRoute"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: brandColors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62 + Math.max(insets.bottom, Platform.OS === 'android' ? 6 : 0),
          paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 4),
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
        },
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarAccessibilityLabel: 'Home Dashboard Tab',
          tabBarIcon: ({ focused }) => (
            <HomeIcon
              size={22}
              color={focused ? brandColors.primary : colors.textMuted}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="CustomerTab"
        component={CustomerListScreen}
        options={{
          tabBarLabel: 'Customer',
          tabBarAccessibilityLabel: 'Customer Management Tab',
          tabBarIcon: ({ focused }) => (
            <UsersIcon
              size={22}
              color={focused ? brandColors.primary : colors.textMuted}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="PosTab"
        component={PosBillingScreen}
        options={{
          tabBarLabel: 'Make Bills',
          tabBarAccessibilityLabel: 'POS Terminal and Billing Tab',
          tabBarIcon: ({ focused }) => (
            <ReceiptIcon
              size={22}
              color={focused ? brandColors.primary : colors.textMuted}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductListScreen}
        options={{
          tabBarLabel: 'Product',
          tabBarAccessibilityLabel: 'Product Directory and Inventory Tab',
          tabBarIcon: ({ focused }) => (
            <PackageIcon
              size={22}
              color={focused ? brandColors.primary : colors.textMuted}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreMenuScreen}
        options={{
          tabBarLabel: 'More',
          tabBarAccessibilityLabel: 'More Store Operations and Settings Tab',
          tabBarIcon: ({ focused }) => (
            <GridIcon
              size={22}
              color={focused ? brandColors.primary : colors.textMuted}
              strokeWidth={focused ? 2.5 : 2}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDark, colors, brandColors } = useTheme();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: brandColors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: brandColors.primary,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {isLoading || showSplash ? (
          <Stack.Screen name="Splash" component={SplashScreen} />
        ) : !isAuthenticated ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen name="PosBilling" component={PosBillingScreen} />
            <Stack.Screen name="ProductList" component={ProductListScreen} />
            <Stack.Screen name="Inventory" component={InventoryScreen} />
            <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
            <Stack.Screen name="AddProduct" component={AddProductScreen} />
            <Stack.Screen name="EditProduct" component={EditProductScreen} />
            <Stack.Screen name="StockAdjustment" component={StockAdjustmentScreen} />
            <Stack.Screen name="SalesList" component={SalesListScreen} />
            <Stack.Screen name="SaleDetail" component={SaleDetailScreen} />
            <Stack.Screen name="PurchaseList" component={PurchaseListScreen} />
            <Stack.Screen name="CreatePurchase" component={CreatePurchaseScreen} />
            <Stack.Screen name="CustomerList" component={CustomerListScreen} />
            <Stack.Screen name="SupplierList" component={SupplierListScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
            <Stack.Screen name="InventoryValuation" component={InventoryValuationScreen} />
            <Stack.Screen name="Finance" component={FinanceScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="AccountDetail" component={AccountDetailScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
