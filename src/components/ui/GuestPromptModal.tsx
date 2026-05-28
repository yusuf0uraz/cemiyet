import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGuestPromptStore } from '../../store/guestPromptStore';
import { useAuthStore } from '../../store/authStore';
import { colors, r, fontSizes } from '../../tokens';

export function GuestPromptModal() {
  const { visible, message, hide } = useGuestPromptStore();
  const logout = useAuthStore(s => s.logout);
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const handleLogin = () => {
    hide();
    // isGuest false yaparak Auth ekranına gönder
    logout();
  };

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={hide}>
      <TouchableWithoutFeedback onPress={hide}>
        <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              entering={SlideInDown.springify().damping(18)}
              style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}
            >
              {/* Handle */}
              <View style={styles.handle} />

              {/* İkon */}
              <View style={styles.iconWrap}>
                <Text style={styles.icon}>🔑</Text>
              </View>

              <Text style={styles.title}>Giriş Gerekiyor</Text>
              <Text style={styles.message}>{message}</Text>

              <TouchableOpacity style={styles.btnEmber} onPress={handleLogin} activeOpacity={0.85}>
                <Text style={styles.btnEmberText}>Giriş Yap / Üye Ol</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.btnGhost} onPress={hide} activeOpacity={0.85}>
                <Text style={styles.btnGhostText}>Misafir olarak devam et</Text>
              </TouchableOpacity>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: 'center',
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: colors.stone3, marginBottom: 20,
  },
  iconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#FFF0EE',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  icon: { fontSize: 32 },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: fontSizes['4xl'],
    color: colors.ink,
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  message: {
    fontFamily: 'Manrope_500Medium',
    fontSize: fontSizes.lg,
    color: colors.stone,
    textAlign: 'center',
    lineHeight: fontSizes.lg * 1.5,
    marginBottom: 24,
    maxWidth: 280,
  },
  btnEmber: {
    width: '100%',
    backgroundColor: colors.ember,
    borderRadius: r.pill,
    paddingVertical: 17,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  btnEmberText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: fontSizes['2xl'],
    color: '#fff',
  },
  btnGhost: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnGhostText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: fontSizes.lg,
    color: colors.stone,
  },
});
