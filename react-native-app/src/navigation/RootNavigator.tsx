import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from './context/AuthContext';
import { useStore } from './context/StoreContext';
import { useTheme } from './context/ThemeContext';
import { navigationRef } from './navigationService';
import { getStoreScreen } from './storeResolver';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { storeType } = useStore();
  const { isDark, colors, brandColors } = useTheme();
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    if (!isLoading) {
      setShowSplash(false);
    }
  }, [isLoading]);

  const SplashComponent = React.useMemo(
    () => getStoreScreen(storeType, 'Splash'),
    [storeType]
  );

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: isDark,
        colors: {
          primary: brandColors.primaryOrange,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: brandColors.primaryOrange,
        },
      }}
    >
      {isLoading || showSplash ? (
        <SplashComponent />
      ) : !isAuthenticated ? (
        <AuthNavigator storeType={storeType} />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
};

export default RootNavigator;
