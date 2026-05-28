import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../types';
import { SplashScreen } from '../screens/auth/SplashScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { SmsVerifyScreen } from '../screens/auth/SmsVerifyScreen';
import { ProfileCreateScreen } from '../screens/auth/ProfileCreateScreen';
import { InterestsScreen } from '../screens/auth/InterestsScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="SmsVerify" component={SmsVerifyScreen} />
      <Stack.Screen name="ProfileCreate" component={ProfileCreateScreen} />
      <Stack.Screen name="Interests" component={InterestsScreen} />
    </Stack.Navigator>
  );
}
