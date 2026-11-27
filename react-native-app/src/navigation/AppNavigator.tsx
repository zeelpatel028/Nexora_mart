import RootNavigator from './RootNavigator';

export { RootNavigator };
export { AuthNavigator } from './AuthNavigator';
export { MainNavigator } from './MainNavigator';
export { BottomTabNavigator, MainTabNavigator } from './BottomTabNavigator';
export * from './navigationService';
export * from './storeResolver';

export const AppNavigator = RootNavigator;
export default AppNavigator;
