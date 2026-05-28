import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../types';
import { HomeScreen } from '../screens/home/HomeScreen';
import { EventCreateScreen } from '../screens/event/EventCreateScreen';
import { EventDetailScreen } from '../screens/event/EventDetailScreen';
import { CheckInScreen } from '../screens/event/CheckInScreen';
import { EventArchiveScreen } from '../screens/event/EventArchiveScreen';
import { ClubProfileScreen } from '../screens/club/ClubProfileScreen';
import { ClubWallScreen } from '../screens/club/ClubWallScreen';
import { MemberManageScreen } from '../screens/club/MemberManageScreen';
import { OtherProfileScreen } from '../screens/profile/OtherProfileScreen';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="EventCreate" component={EventCreateScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="CheckIn" component={CheckInScreen} />
      <Stack.Screen name="EventArchive" component={EventArchiveScreen} />
      <Stack.Screen name="ClubProfile" component={ClubProfileScreen} />
      <Stack.Screen name="ClubWall" component={ClubWallScreen} />
      <Stack.Screen name="MemberManage" component={MemberManageScreen} />
      <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
    </Stack.Navigator>
  );
}
