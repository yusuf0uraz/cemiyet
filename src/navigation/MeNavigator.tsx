import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MeStackParamList } from '../types';
import { MyProfileScreen } from '../screens/profile/MyProfileScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { PrivacySettingsScreen } from '../screens/profile/PrivacySettingsScreen';
import { OtherProfileScreen } from '../screens/profile/OtherProfileScreen';
import { ProfileEditScreen } from '../screens/profile/ProfileEditScreen';
import { ClubProfileScreen } from '../screens/club/ClubProfileScreen';

const Stack = createNativeStackNavigator<MeStackParamList>();

export function MeNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="MyProfile" component={MyProfileScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
      <Stack.Screen name="OtherProfile" component={OtherProfileScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="ClubProfile" component={ClubProfileScreen} />
    </Stack.Navigator>
  );
}
