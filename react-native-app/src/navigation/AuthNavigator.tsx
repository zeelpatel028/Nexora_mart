import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { getStoreScreen, StoreTypeCode } from './storeResolver';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AuthNavigator: React.FC<{ storeType?: StoreTypeCode }> = ({
  storeType = 'grocery',
}) => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 200,
      }}
    >
      <Stack.Screen
        name="Login"
        getComponent={() => getStoreScreen(storeType, 'Login')}
        options={{ animation: 'fade' }}
      />
      <Stack.Screen
        name="Register"
        getComponent={() => getStoreScreen(storeType, 'Register')}
      />
      <Stack.Screen
        name="ForgotPassword"
        getComponent={() => getStoreScreen(storeType, 'ForgotPassword')}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
