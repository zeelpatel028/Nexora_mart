import React, { useMemo } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { useStore } from './context/StoreContext';
import { getStoreModule } from './storeResolver';
import FloatingTabBar from './components/FloatingTabBar';
import { withTabTransition } from './components/AnimatedTabScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const BottomTabNavigator: React.FC = () => {
  const { storeType } = useStore();

  const tabScreens = useMemo(() => {
    const mod = getStoreModule(storeType);
    return {
      DashboardTab: withTabTransition(mod.getScreen('DashboardTab')),
      CustomerTab: withTabTransition(mod.getScreen('CustomerTab')),
      PosTab: withTabTransition(mod.getScreen('PosTab')),
      ProductsTab: withTabTransition(mod.getScreen('ProductsTab')),
      MoreTab: withTabTransition(mod.getScreen('MoreTab')),
    };
  }, [storeType]);

  return (
    <Tab.Navigator
      initialRouteName="DashboardTab"
      backBehavior="initialRoute"
      detachInactiveScreens={false}
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        lazy: true,
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={tabScreens.DashboardTab}
        options={{ tabBarLabel: 'Home', tabBarAccessibilityLabel: 'Home Dashboard Tab' }}
      />
      <Tab.Screen
        name="CustomerTab"
        component={tabScreens.CustomerTab}
        options={{ tabBarLabel: 'Customer', tabBarAccessibilityLabel: 'Customer Tab' }}
      />
      <Tab.Screen
        name="PosTab"
        component={tabScreens.PosTab}
        options={{ tabBarLabel: 'Make Bill', tabBarAccessibilityLabel: 'Make Bill Tab' }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={tabScreens.ProductsTab}
        options={{ tabBarLabel: 'Products', tabBarAccessibilityLabel: 'Products Tab' }}
      />
      <Tab.Screen
        name="MoreTab"
        component={tabScreens.MoreTab}
        options={{ tabBarLabel: 'More', tabBarAccessibilityLabel: 'More Tab' }}
      />
    </Tab.Navigator>
  );
};

export const MainTabNavigator = BottomTabNavigator;
export default BottomTabNavigator;
