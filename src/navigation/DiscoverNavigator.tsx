import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DiscoverStackParamList } from '../types';
import { DiscoverScreen } from '../screens/home/DiscoverScreen';
import { SearchScreen } from '../screens/home/SearchScreen';
import { MapScreen } from '../screens/home/MapScreen';
import { EventDetailScreen } from '../screens/event/EventDetailScreen';
import { ClubProfileScreen } from '../screens/club/ClubProfileScreen';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export function DiscoverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Discover" component={DiscoverScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="ClubProfile" component={ClubProfileScreen} />
    </Stack.Navigator>
  );
}
