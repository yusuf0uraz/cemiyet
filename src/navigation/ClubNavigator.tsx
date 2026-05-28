import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ClubStackParamList } from '../types';
import { ClubsScreen } from '../screens/club/ClubsScreen';
import { ClubCreateScreen } from '../screens/club/ClubCreateScreen';
import { ClubProfileScreen } from '../screens/club/ClubProfileScreen';
import { ClubWallScreen } from '../screens/club/ClubWallScreen';
import { MemberManageScreen } from '../screens/club/MemberManageScreen';
import { OtherProfileScreen } from '../screens/profile/OtherProfileScreen';
import { EventDetailScreen } from '../screens/event/EventDetailScreen';
import { EventArchiveScreen } from '../screens/event/EventArchiveScreen';

const Stack = createNativeStackNavigator<ClubStackParamList>();

export function ClubNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Clubs" component={ClubsScreen} />
      <Stack.Screen name="ClubCreate" component={ClubCreateScreen} options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="ClubProfile" component={ClubProfileScreen} />
      <Stack.Screen name="ClubWall" component={ClubWallScreen} />
      <Stack.Screen name="MemberManage" component={MemberManageScreen} />
      <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
      <Stack.Screen name="EventArchive" component={EventArchiveScreen} />
    </Stack.Navigator>
  );
}
