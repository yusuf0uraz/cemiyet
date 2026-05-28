import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_800ExtraBold,
} from '@expo-google-fonts/manrope';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ToastContainer } from './src/components/ui/Toast';
import { GuestPromptModal } from './src/components/ui/GuestPromptModal';
import { useAuthStore } from './src/store/authStore';
import { useEventsStore } from './src/store/eventsStore';
import { useClubsStore } from './src/store/clubsStore';
import { colors, fontSizes } from './src/tokens';

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    Manrope_800ExtraBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });
  const [sessionRestored, setSessionRestored] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState('Başlatılıyor...');

  const restoreSession = useAuthStore(s => s.restoreSession);
  const fetchBookmarks = useEventsStore(s => s.fetchBookmarks);
  const fetchJoined    = useEventsStore(s => s.fetchJoined);
  const fetchEvents    = useEventsStore(s => s.fetchEvents);
  const fetchClubs     = useClubsStore(s => s.fetchClubs);

  useEffect(() => {
    (async () => {
      try {
        setLoadingLabel('Oturum yükleniyor...');
        await restoreSession();
        setLoadingLabel('Veriler yükleniyor...');
        await Promise.allSettled([
          fetchEvents(),
          fetchClubs(),
          fetchBookmarks(),
          fetchJoined(),
        ]);
      } catch {
        // hata olsa bile uygulamayı aç
      } finally {
        setSessionRestored(true);
      }
    })();
  }, []);

  if ((!fontsLoaded && !fontError) || !sessionRestored) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
      }}>
        <ActivityIndicator color={colors.ember} size="large" />
        <Text style={{ fontFamily: 'System', fontSize: 14, color: colors.stone }}>
          {loadingLabel}
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
          <ToastContainer />
          <GuestPromptModal />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
