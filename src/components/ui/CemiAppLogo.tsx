import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, r } from '../../tokens';

interface LogoProps {
  size?: number;
  color?: string;
}

export function CemiAppLogo({ size = 36, color = colors.ember }: LogoProps) {
  return (
    <View style={{
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size * 0.24,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      overflow: 'hidden',
    }}>
      {/* Parlama efekti */}
      <View style={{
        position: 'absolute',
        top: -size * 0.4,
        left: -size * 0.2,
        width: size * 0.9,
        height: size * 0.9,
        borderRadius: size * 0.45,
        backgroundColor: 'rgba(255,255,255,0.28)',
      }} />
      <Text style={{
        color: '#fff',
        fontSize: size * 0.55,
        fontFamily: 'Manrope_800ExtraBold',
        letterSpacing: -0.04 * size,
      }}>c</Text>
    </View>
  );
}

export function CemiAppWordmark({ size = 22, color = colors.ink }: LogoProps) {
  return (
    <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: size, letterSpacing: -0.03 * size, color }}>
      cemi<Text style={{ color: colors.ember }}>app</Text>
    </Text>
  );
}
