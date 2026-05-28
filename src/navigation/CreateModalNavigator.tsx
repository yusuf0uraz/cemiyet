import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CreateModalParamList } from '../types';
import { EventCreateScreen } from '../screens/event/EventCreateScreen';
import { ClubCreateScreen } from '../screens/club/ClubCreateScreen';

const Stack = createNativeStackNavigator<CreateModalParamList>();

export function CreateModalNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_bottom' }}>
      <Stack.Screen name="EventCreate" component={EventCreateScreen} />
      <Stack.Screen name="ClubCreate" component={ClubCreateScreen} />
    </Stack.Navigator>
  );
}
