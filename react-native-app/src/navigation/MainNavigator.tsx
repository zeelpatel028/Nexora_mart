import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { useStore } from './context/StoreContext';
import { getStoreScreen } from './storeResolver';
import BottomTabNavigator from './BottomTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

const STACK_ROUTES: (keyof RootStackParamList)[] = [
  'PosBilling',
  'ProductList',
  'Inventory',
  'ProductDetail',
  'AddProduct',
  'EditProduct',
  'SalesList',
  'SaleDetail',
  'Invoice',
  'PurchaseList',
  'PurchaseOrder',
  'CreatePurchase',
  'CustomerList',
  'CustomerDetail',
  'Khata',
  'SupplierList',
  'SupplierDetail',
  'AddSupplier',
  'Reports',
  'InventoryValuation',
  'Finance',
  'Profile',
  'Settings',
  'AccountDetail',
  'PrivacyPolicy',
];

/**
 * Loads ONLY the authenticated user's store screens dynamically and lazily.
 */
export const MainNavigator: React.FC = () => {
  const { storeType } = useStore();

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 220,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={BottomTabNavigator}
        options={{ animation: 'fade' }}
      />
      {STACK_ROUTES.map((routeName) => (
        <Stack.Screen
          key={routeName}
          name={routeName}
          getComponent={() => getStoreScreen(storeType, routeName)}
        />
      ))}
    </Stack.Navigator>
  );
};

export default MainNavigator;
