import React from 'react';
import {
  TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator,
} from 'react-native';
import { colors, r, fontSizes, fontWeights, sh } from '../../tokens';

type ButtonVariant = 'ember' | 'dark' | 'ghost';

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  label, onPress, variant = 'ember', style, textStyle,
  icon, iconRight, fullWidth, loading, disabled, size = 'md',
}: ButtonProps) {
  const padV = size === 'sm' ? 10 : size === 'lg' ? 18 : 14;
  const padH = size === 'sm' ? 16 : size === 'lg' ? 24 : 22;
  const fontSize = size === 'sm' ? fontSizes.md : size === 'lg' ? fontSizes['2xl'] : fontSizes.xl;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        variant === 'ember' && styles.ember,
        variant === 'dark' && styles.dark,
        variant === 'ghost' && styles.ghost,
        { paddingVertical: padV, paddingHorizontal: padH },
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        style,
      ]}
      activeOpacity={0.82}
    >
      {icon && icon}
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'ghost' ? colors.ink : '#fff'} />
      ) : (
        <Text style={[
          styles.text,
          variant === 'ghost' && styles.textGhost,
          { fontSize },
          textStyle,
        ]}>{label}</Text>
      )}
      {iconRight && iconRight}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: r.pill,
    gap: 8,
  },
  ember: {
    backgroundColor: colors.ember,
    ...sh.ember,
  },
  dark: {
    backgroundColor: colors.ink,
  },
  ghost: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.ruleStrong,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: 'Manrope_700Bold',
    fontWeight: fontWeights.bold,
    color: '#fff',
    letterSpacing: -0.1,
  },
  textGhost: {
    color: colors.ink,
  },
});
