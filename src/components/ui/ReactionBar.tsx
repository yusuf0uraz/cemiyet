import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IcnHeartFill, IcnCalendarCheck, IcnBurst, IcnTrophy } from './Icons';
import { colors, r, fontWeights, fontSizes } from '../../tokens';
import type { ReactionKey } from '../../tokens';

const reactionDefs: Record<ReactionKey, {
  label: string; color: string; Icon: (p: { size: number; color: string }) => React.ReactElement
}> = {
  bravo:     { label: 'Bravo',     color: '#E84C2C', Icon: (p) => <IcnHeartFill size={p.size} color={p.color} /> },
  geliyorum: { label: 'Geliyorum', color: '#2E7DD8', Icon: (p) => <IcnCalendarCheck size={p.size} color={p.color} /> },
  super:     { label: 'Süper',     color: '#D49B2E', Icon: (p) => <IcnBurst size={p.size} color={p.color} /> },
  tebrik:    { label: 'Tebrik',    color: '#7A4DD8', Icon: (p) => <IcnTrophy size={p.size} color={p.color} /> },
};

interface ReactionBarProps {
  counts: Partial<Record<ReactionKey, number>>;
  dark?: boolean;
  compact?: boolean;
}

export function ReactionBar({ counts, dark = false, compact = false }: ReactionBarProps) {
  const entries = (Object.entries(counts) as [ReactionKey, number][]).filter(([_, n]) => n > 0);

  return (
    <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      {entries.map(([key, n]) => {
        const def = reactionDefs[key];
        if (!def) return null;
        const iconSize = compact ? 10 : 13;
        const bubbleSize = compact ? 18 : 22;

        return (
          <View key={key} style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: compact ? 3 : 5,
            paddingHorizontal: compact ? 6 : 8,
            paddingLeft: compact ? 4 : 5,
            backgroundColor: dark ? 'rgba(255,255,255,0.08)' : colors.surface,
            borderWidth: dark ? 0 : 1,
            borderColor: colors.ruleSoft,
            borderRadius: r.pill,
          }}>
            <View style={{
              width: bubbleSize, height: bubbleSize,
              borderRadius: bubbleSize / 2,
              backgroundColor: def.color,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <def.Icon size={iconSize} color="#fff" />
            </View>
            <Text style={{
              fontFamily: 'Manrope_700Bold',
              fontWeight: fontWeights.bold,
              fontSize: compact ? fontSizes.base : fontSizes.md,
              color: dark ? '#fff' : colors.ink,
            }}>{n}</Text>
          </View>
        );
      })}
    </View>
  );
}

export function ReactionPickerCompact({ dark = false, onSelect }: {
  dark?: boolean;
  onSelect?: (key: ReactionKey) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {(Object.entries(reactionDefs) as [ReactionKey, typeof reactionDefs[ReactionKey]][]).map(([key, def]) => (
        <TouchableOpacity
          key={key}
          onPress={() => onSelect?.(key)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingVertical: 8,
            paddingRight: 14,
            paddingLeft: 8,
            backgroundColor: dark ? 'rgba(255,255,255,0.08)' : colors.surface,
            borderWidth: 1,
            borderColor: dark ? 'rgba(255,255,255,0.1)' : colors.ruleSoft,
            borderRadius: r.pill,
          }}
        >
          <View style={{
            width: 26, height: 26, borderRadius: 13,
            backgroundColor: def.color,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <def.Icon size={14} color="#fff" />
          </View>
          <Text style={{
            fontFamily: 'Manrope_700Bold',
            fontSize: fontSizes.md,
            color: dark ? '#fff' : colors.ink,
          }}>{def.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
