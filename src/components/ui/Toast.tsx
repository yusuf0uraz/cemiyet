import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useToastStore, type ToastType } from '../../store/toastStore';
import { colors, r, fontSizes } from '../../tokens';

const BG: Record<ToastType, string> = {
  success: colors.forest,
  error:   colors.ember,
  info:    colors.ocean,
};

export function ToastContainer() {
  const { visible, message, type, emoji } = useToastStore();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, { damping: 18, stiffness: 220 });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withTiming(80, { duration: 260 });
      opacity.value = withTiming(0, { duration: 220 });
    }
  }, [visible]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.wrap, animStyle, { bottom: insets.bottom + 80 }]}
      pointerEvents="none"
    >
      <View style={[styles.pill, { backgroundColor: BG[type] }]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.msg}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute', left: 0, right: 0,
    alignItems: 'center', zIndex: 9999,
  },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 12,
    borderRadius: r.pill,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 10,
    maxWidth: 320,
  },
  emoji: {
    fontSize: 16,
  },
  msg: {
    fontFamily: 'Manrope_700Bold',
    fontSize: fontSizes.lg,
    color: '#fff',
    flexShrink: 1,
  },
});
