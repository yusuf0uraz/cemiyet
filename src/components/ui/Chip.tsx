import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, r, fontSizes, fontWeights } from '../../tokens';

type ChipVariant = 'default' | 'ember' | 'forest' | 'amber' | 'grape' | 'ocean' | 'dark' | 'outline';

const chipColors: Record<ChipVariant, { bg: string; text: string }> = {
  default:  { bg: colors.surface3, text: colors.ink },
  ember:    { bg: 'rgba(232,76,44,0.12)', text: colors.emberDeep },
  forest:   { bg: 'rgba(46,139,87,0.12)', text: colors.forest },
  amber:    { bg: 'rgba(212,155,46,0.18)', text: '#8B6818' },
  grape:    { bg: 'rgba(122,77,216,0.13)', text: '#5A3CA8' },
  ocean:    { bg: 'rgba(46,125,216,0.13)', text: '#1F5FAC' },
  dark:     { bg: colors.ink, text: '#fff' },
  outline:  { bg: 'transparent', text: colors.stone },
};

interface ChipProps {
  label?: string;
  children?: string;
  variant?: ChipVariant;
  icon?: React.ReactNode;
  style?: ViewStyle;
  size?: 'sm' | 'md';
}

export function Chip({ label, children, variant = 'default', icon, style, size = 'md' }: ChipProps) {
  const displayLabel = label ?? children ?? '';
  const { bg, text } = chipColors[variant];
  const padV = size === 'sm' ? 3 : 5;
  const padH = size === 'sm' ? 9 : 12;
  const fontSize = size === 'sm' ? fontSizes.base : fontSizes.md;

  return (
    <View style={[
      styles.base,
      { backgroundColor: bg, paddingVertical: padV, paddingHorizontal: padH },
      variant === 'outline' && styles.outline,
      style,
    ]}>
      {icon}
      <Text style={[styles.text, { color: text, fontSize }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: r.pill,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.rule,
  },
  text: {
    fontFamily: 'Manrope_600SemiBold',
    fontWeight: fontWeights.semibold,
  },
});

// Live Badge
export function LiveBadge({ label = 'CANLI' }: { label?: string }) {
  return (
    <View style={liveBadgeStyles.container}>
      <View style={liveBadgeStyles.dot} />
      <Text style={liveBadgeStyles.text}>{label}</Text>
    </View>
  );
}

const liveBadgeStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.ember,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: r.pill,
  },
  dot: {
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  text: {
    color: '#fff',
    fontSize: fontSizes.sm,
    fontFamily: 'Manrope_800ExtraBold',
    letterSpacing: 0.6,
  },
});

// Mono Label (küçük başlık)
export function MonoLabel({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <Text style={[monoLabelStyle, style]}>
      {children}
    </Text>
  );
}

const monoLabelStyle: any = {
  fontFamily: 'JetBrainsMono_500Medium',
  fontSize: fontSizes.xs,
  letterSpacing: 1.4,
  textTransform: 'uppercase' as const,
  color: colors.stone,
};
