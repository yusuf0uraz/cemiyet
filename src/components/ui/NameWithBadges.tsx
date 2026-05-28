import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';
import { IcnCrownFill, IcnShieldFill, IcnSparkle } from './Icons';
import { colors, fontWeights } from '../../tokens';

type Badge = 'verified' | 'reis' | 'yardimci' | 'pro';

interface NameWithBadgesProps {
  name: string;
  badges?: Badge[];
  size?: number;
  dark?: boolean;
}

export function NameWithBadges({ name, badges = [], size = 16, dark = false }: NameWithBadgesProps) {
  const textColor = dark ? '#fff' : colors.ink;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
      <Text style={{
        fontFamily: 'Manrope_700Bold',
        fontWeight: fontWeights.bold,
        fontSize: size,
        color: textColor,
        letterSpacing: -0.01 * size,
      }}>
        {name}
      </Text>
      {badges.map((b, i) => (
        <BadgeIcon key={i} badge={b} size={size} />
      ))}
    </View>
  );
}

function BadgeIcon({ badge, size }: { badge: string; size: number }) {
  if (badge === 'verified') {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="#2E7DD8">
        <Path d="M12 2l2.5 1.5L17 3l1 2.5L20 7l-.5 2.5L21 12l-1.5 2L20 17l-2 1-1 2.5-2.5-.5L12 22l-2.5-1.5L7 21l-1-2.5L4 17l.5-2.5L3 12l1.5-2L4 7l2-1 1-2.5L9.5 4 12 2z" />
        <Polyline points="8.5 12 11 14.5 15.5 10" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  if (badge === 'reis') {
    return <IcnCrownFill size={size + 2} color={colors.ember} />;
  }
  if (badge === 'yardimci') {
    return <IcnShieldFill size={size} color={colors.amber} />;
  }
  if (badge === 'pro') {
    return (
      <View style={{
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        backgroundColor: colors.ember,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
      }}>
        <IcnSparkle size={size * 0.55} color="#fff" />
        <Text style={{
          color: '#fff',
          fontFamily: 'Manrope_800ExtraBold',
          fontSize: size * 0.55,
          letterSpacing: 0.4,
        }}>PRO</Text>
      </View>
    );
  }
  return null;
}
