import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MapStackParamList } from '../types';
import { MapScreen } from '../screens/home/MapScreen';
import { EventDetailScreen } from '../screens/event/EventDetailScreen';
import { ClubProfileScreen } from '../screens/club/ClubProfileScreen';

const Stack = createNativeStackNavigator<MapStackParamList>();

export function MapNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="ClubProfile" component={ClubProfileScreen} />
    </Stack.Navigator>
  );
}
