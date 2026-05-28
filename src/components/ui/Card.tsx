import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
// StyleSheet is also needed by PhotoSlot — single import above covers it
import { colors, r, sh } from '../../tokens';

interface CardProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  noPad?: boolean;
}

export function Card({ children, style, size = 'md', noPad }: CardProps) {
  return (
    <View style={[
      styles.base,
      size === 'md' && styles.md,
      size === 'lg' && styles.lg,
      noPad && styles.noPad,
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...sh.md,
  },
  md: {
    borderRadius: r.md,
  },
  lg: {
    borderRadius: r.lg,
  },
  noPad: {
    padding: 0,
  },
});

// Photo — gerçek görsel veya gradient placeholder
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { colors as c } from '../../tokens';

type PhotoTone = '1' | '2' | '3' | '4' | '5';

const photoGradients: Record<PhotoTone, [string, string]> = {
  '1': [c.emberGlow, c.emberDeep],
  '2': [c.forest, '#1F5F40'],
  '3': [c.amberLight, c.amber],
  '4': [c.grape, '#4A2B85'],
  '5': [c.ocean, '#1F5FAC'],
};

interface PhotoSlotProps {
  tone?: PhotoTone;
  uri?: string;
  height?: number;
  width?: number | string;
  style?: ViewStyle;
  children?: React.ReactNode;
}

export function PhotoSlot({ tone = '1', uri, height = 140, width, style, children }: PhotoSlotProps) {
  const baseStyle: ViewStyle = {
    height,
    width: (width as any) ?? '100%',
    overflow: 'hidden',
    position: 'relative',
  };

  if (uri) {
    return (
      <View style={[baseStyle, style]}>
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          transition={300}
        />
        {children}
      </View>
    );
  }

  const [start, end] = photoGradients[tone];
  return (
    <LinearGradient
      colors={[start, end]}
      start={{ x: 0.3, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[baseStyle, style]}
    >
      {children}
    </LinearGradient>
  );
}
