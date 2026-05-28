import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { MainTabParamList } from '../types';
import { HomeNavigator } from './HomeNavigator';
import { DiscoverNavigator } from './DiscoverNavigator';
import { MapNavigator } from './MapNavigator';
import { ClubNavigator } from './ClubNavigator';
import { MeNavigator } from './MeNavigator';
import {
  IcnHome, IcnCompass, IcnMap, IcnUsers, IcnUser,
} from '../components/ui/Icons';
import { colors, r, fontSizes } from '../tokens';

const Tab = createBottomTabNavigator<MainTabParamList>();

function MapTabIcon({ focused }: { focused: boolean }) {
  if (!focused) {
    return (
      <View style={mapIcon.wrap}>
        <IcnMap size={24} color={colors.stone} />
      </View>
    );
  }
  return (
    <View style={mapIcon.wrapActive}>
      <LinearGradient
        colors={[colors.emberSoft, colors.ember]}
        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
        style={mapIcon.gradient}
      >
        <IcnMap size={22} color="#fff" />
      </LinearGradient>
    </View>
  );
}

const mapIcon = StyleSheet.create({
  wrap: {
    width: 48, height: 32, alignItems: 'center', justifyContent: 'center',
  },
  wrapActive: {
    marginTop: -6,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  gradient: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
});

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: (insets.bottom || 0) + 8,
            height: 62 + (insets.bottom || 0),
          },
        ],
        tabBarActiveTintColor: colors.ember,
        tabBarInactiveTintColor: colors.stone,
        tabBarLabelStyle: styles.tabLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Keşfet',
          tabBarIcon: ({ color }) => <IcnHome size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="DiscoverTab"
        component={DiscoverNavigator}
        options={{
          tabBarLabel: 'Ara',
          tabBarIcon: ({ color }) => <IcnCompass size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapNavigator}
        options={{
          tabBarLabel: ({ focused }) => (
            <Text style={[
              styles.tabLabel,
              { color: focused ? colors.ember : colors.stone },
              focused && { fontFamily: 'Manrope_700Bold' },
            ]}>Harita</Text>
          ),
          tabBarIcon: ({ focused }) => <MapTabIcon focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ClubsTab"
        component={ClubNavigator}
        options={{
          tabBarLabel: 'Cemiyetler',
          tabBarIcon: ({ color }) => <IcnUsers size={22} color={color} />,
        }}
      />
      <Tab.Screen
        name="MeTab"
        component={MeNavigator}
        options={{
          tabBarLabel: 'Ben',
          tabBarIcon: ({ color }) => <IcnUser size={22} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.ruleSoft,
    height: 62,
    paddingTop: 6,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  tabLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: fontSizes.xs,
    marginTop: 1,
  },
});
