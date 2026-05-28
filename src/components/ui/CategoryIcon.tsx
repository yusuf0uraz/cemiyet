import React from 'react';
import { View, ViewStyle } from 'react-native';
import Svg, { Circle, Path, Line, Polygon, Rect } from 'react-native-svg';
import { categories, CategoryKey } from '../../tokens';

interface CategoryIconProps {
  name: CategoryKey;
  size?: number;
  filled?: boolean;
  square?: boolean;
  style?: ViewStyle;
}

function catSvg(name: CategoryKey, size: number, color: string) {
  const sw = 1.6;
  const s = size;

  switch (name) {
    case 'tenis':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Circle cx="12" cy="12" r="9" /><Path d="M3.5 7A9 9 0 0 1 12 21M20.5 17A9 9 0 0 1 12 3" />
      </Svg>;
    case 'futbol':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Circle cx="12" cy="12" r="9" /><Polygon points="12 7 16 10 14.5 15 9.5 15 8 10" />
      </Svg>;
    case 'bisiklet':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Circle cx="6" cy="16" r="3.5" /><Circle cx="18" cy="16" r="3.5" />
        <Path d="M6 16l4-7h5l3 7M10 9l-1-3h-2" />
      </Svg>;
    case 'yuruyus':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Path d="M3 20l5-6 3 3 4-6 6 9M3 20h18" /><Path d="M14 5l2 1-1 3" />
      </Svg>;
    case 'kitap':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Path d="M4 4h7v16H4zM13 4h7v16h-7z" />
      </Svg>;
    case 'sinema':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Rect x="3" y="5" width="18" height="14" rx="1" />
        <Line x1="7" y1="5" x2="5" y2="3" /><Line x1="11" y1="5" x2="9" y2="3" />
        <Line x1="15" y1="5" x2="13" y2="3" /><Line x1="19" y1="5" x2="17" y2="3" />
      </Svg>;
    case 'muzik':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Circle cx="7" cy="18" r="2" /><Circle cx="17" cy="16" r="2" />
        <Path d="M9 18V6l10-2v12" />
      </Svg>;
    case 'atolye':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Path d="M5 22l4-12h6l4 12M9 10l3-7 3 7" />
      </Svg>;
    case 'kahve':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Path d="M5 9h12v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM17 11h2a2 2 0 0 1 0 4h-2M9 4c0 1 1 1 1 2s-1 1-1 2M13 4c0 1 1 1 1 2s-1 1-1 2" />
      </Svg>;
    case 'yemek':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Path d="M6 3v8a3 3 0 0 0 6 0V3M9 11v10M16 3v18M16 3a3 3 0 0 1 3 3v5h-3" />
      </Svg>;
    case 'oyun':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Rect x="3" y="7" width="18" height="11" rx="3" />
        <Line x1="7" y1="11" x2="7" y2="14" /><Line x1="5.5" y1="12.5" x2="8.5" y2="12.5" />
        <Circle cx="15" cy="11" r="1" fill={color} /><Circle cx="17" cy="14" r="1" fill={color} />
      </Svg>;
    case 'satranc':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Path d="M9 5h6l-1 2v4l2 3v3H8v-3l2-3V7zM6 17h12v3H6z" />
      </Svg>;
    case 'dans':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Circle cx="12" cy="5" r="2" />
        <Path d="M12 7v4l-3 3 1 6M12 11l3 3-2 6M9 11l-3 1M15 11l3-1" />
      </Svg>;
    case 'foto':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Path d="M3 7h4l2-2h6l2 2h4v13H3z" /><Circle cx="12" cy="13" r="4" />
      </Svg>;
    case 'doga':
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Path d="M12 22V12M5 12l7-10 7 10M7 17l5-6 5 6" />
      </Svg>;
    default:
      return <Svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw}>
        <Circle cx="12" cy="12" r="9" />
      </Svg>;
  }
}

export function CategoryIcon({ name, size = 36, filled = false, square = false, style }: CategoryIconProps) {
  const def = categories[name] || categories.tenis;
  const bg = filled ? def.color : 'transparent';
  const fg = filled ? '#fff' : def.color;
  const iconSize = size * 0.55;

  return (
    <View style={[
      {
        width: size,
        height: size,
        borderRadius: square ? size * 0.28 : size / 2,
        backgroundColor: bg,
        borderWidth: filled ? 0 : 1.5,
        borderColor: def.color,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      },
      style,
    ]}>
      {catSvg(name, iconSize, fg)}
    </View>
  );
}
