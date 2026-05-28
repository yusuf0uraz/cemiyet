import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fontWeights } from '../../tokens';

type AvatarTone = '1' | '2' | '3' | '4' | '5';

const toneGradients: Record<AvatarTone, [string, string]> = {
  '1': [colors.emberGlow, colors.emberDeep],
  '2': [colors.forest, '#1F5F40'],
  '3': [colors.amberLight, colors.amber],
  '4': [colors.grape, '#4A2B85'],
  '5': [colors.ocean, '#1F5FAC'],
};

interface AvatarProps {
  size?: number;
  tone?: AvatarTone;
  text?: string;
  name?: string;
  uri?: string;
  style?: ViewStyle;
}

export function Avatar({ size = 40, tone = '1', text, name, uri, style }: AvatarProps) {
  const displayText = text ?? (name ? name.charAt(0).toUpperCase() : undefined);
  const [start, end] = toneGradients[tone];
  const fontSize = size * 0.36;
  const baseStyle = { width: size, height: size, borderRadius: size / 2, flexShrink: 0 as const };

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[baseStyle as ImageStyle, { overflow: 'hidden' }, style as ImageStyle]}
        resizeMode="cover"
      />
    );
  }

  return (
    <LinearGradient
      colors={[start, end]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[baseStyle, { alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {displayText ? (
        <Text style={{
          color: '#fff',
          fontSize,
          fontFamily: 'Manrope_700Bold',
          fontWeight: fontWeights.bold,
        }}>
          {displayText}
        </Text>
      ) : null}
    </LinearGradient>
  );
}

// Story ring — gradient çerçeve
interface StoryRingProps {
  size?: number;
  seen?: boolean;
  live?: boolean;
  children?: React.ReactNode;
}

export function StoryRing({ size = 60, seen = false, live = false, children }: StoryRingProps) {
  const padding = 2.5;
  const innerPadding = 2;
  const innerSize = size - (padding + innerPadding) * 2;

  if (seen) {
    return (
      <View style={{ width: size, height: size, position: 'relative' }}>
        <View style={{
          width: size, height: size, borderRadius: size / 2,
          padding,
          backgroundColor: colors.stone3,
        }}>
          <View style={{
            flex: 1, borderRadius: (size - padding * 2) / 2,
            backgroundColor: colors.bg,
            padding: innerPadding,
          }}>
            <View style={{ flex: 1, borderRadius: innerSize / 2, overflow: 'hidden' }}>
              {children}
            </View>
          </View>
        </View>
        {live && <LiveLabel size={size} />}
      </View>
    );
  }

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <LinearGradient
        colors={[colors.ember, colors.amber, colors.emberGlow, colors.ember]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: size, height: size, borderRadius: size / 2,
          padding,
        }}
      >
        <View style={{
          flex: 1, borderRadius: (size - padding * 2) / 2,
          backgroundColor: colors.bg,
          padding: innerPadding,
        }}>
          <View style={{ flex: 1, borderRadius: innerSize / 2, overflow: 'hidden' }}>
            {children}
          </View>
        </View>
      </LinearGradient>
      {live && <LiveLabel size={size} />}
    </View>
  );
}

function LiveLabel({ size }: { size: number }) {
  return (
    <View style={{
      position: 'absolute', bottom: -4, alignSelf: 'center',
      backgroundColor: colors.ember,
      paddingHorizontal: 7, paddingVertical: 2,
      borderRadius: 8,
      borderWidth: 2, borderColor: colors.bg,
    }}>
      <Text style={{
        color: '#fff', fontSize: 9, fontFamily: 'Manrope_800ExtraBold',
        letterSpacing: 0.4,
      }}>CANLI</Text>
    </View>
  );
}
