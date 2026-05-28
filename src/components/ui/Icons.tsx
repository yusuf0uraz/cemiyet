// CemiApp · SVG İkon Kütüphanesi

import React from 'react';
import Svg, {
  Circle, Line, Path, Polygon, Polyline, Rect, Ellipse,
} from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const defaultProps: Required<IconProps> = {
  size: 20,
  color: 'currentColor',
  strokeWidth: 1.8,
};

function icn(props: IconProps, children: React.ReactNode) {
  const { size = 20, color = '#1A1814', strokeWidth = 1.8 } = props;
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export const IcnCalendar = (p: IconProps) => icn(p, <>
  <Rect x="3.5" y="5" width="17" height="15" rx="2.5" />
  <Line x1="3.5" y1="10" x2="20.5" y2="10" />
  <Line x1="8" y1="3" x2="8" y2="6.5" />
  <Line x1="16" y1="3" x2="16" y2="6.5" />
</>);

export const IcnCalendarCheck = (p: IconProps) => icn(p, <>
  <Rect x="3.5" y="5" width="17" height="15" rx="2.5" />
  <Line x1="3.5" y1="10" x2="20.5" y2="10" />
  <Line x1="8" y1="3" x2="8" y2="6.5" />
  <Line x1="16" y1="3" x2="16" y2="6.5" />
  <Polyline points="8 15 11 18 16 13" />
</>);

export const IcnMap = (p: IconProps) => icn(p, <>
  <Path d="M9 4l-5.5 2v14L9 18l6 2 5.5-2V4L15 6 9 4z" />
  <Line x1="9" y1="4" x2="9" y2="18" />
  <Line x1="15" y1="6" x2="15" y2="20" />
</>);

export const IcnSearch = (p: IconProps) => icn(p, <>
  <Circle cx="11" cy="11" r="6.5" />
  <Line x1="16" y1="16" x2="20" y2="20" />
</>);

export const IcnBell = (p: IconProps) => icn(p, <>
  <Path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2.5h-15L6 16z" />
  <Path d="M10 19a2 2 0 0 0 4 0" />
</>);

export const IcnUser = (p: IconProps) => icn(p, <>
  <Circle cx="12" cy="8" r="4" />
  <Path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
</>);

export const IcnUsers = (p: IconProps) => icn(p, <>
  <Circle cx="9" cy="9" r="3.5" />
  <Path d="M3 19c0-3 3-5 6-5s6 2 6 5" />
  <Circle cx="17" cy="7" r="2.5" />
  <Path d="M15 14c4 0 6 2 6 5" />
</>);

export const IcnHome = (p: IconProps) => icn(p, <>
  <Path d="M3 11l9-7 9 7v10h-6v-6h-6v6H3z" />
</>);

export const IcnPlus = (p: IconProps) => icn(p, <>
  <Line x1="12" y1="5" x2="12" y2="19" />
  <Line x1="5" y1="12" x2="19" y2="12" />
</>);

export const IcnArrow = (p: IconProps) => icn(p, <>
  <Line x1="5" y1="12" x2="19" y2="12" />
  <Polyline points="13 6 19 12 13 18" />
</>);

export const IcnArrowLeft = (p: IconProps) => icn(p, <>
  <Line x1="19" y1="12" x2="5" y2="12" />
  <Polyline points="11 6 5 12 11 18" />
</>);

export const IcnChevronDown = (p: IconProps) => icn(p, <>
  <Polyline points="6 9 12 15 18 9" />
</>);

export const IcnChevronRight = (p: IconProps) => icn(p, <>
  <Polyline points="9 6 15 12 9 18" />
</>);

export const IcnClock = (p: IconProps) => icn(p, <>
  <Circle cx="12" cy="12" r="8.5" />
  <Polyline points="12 7 12 12 16 14" />
</>);

export const IcnPin = (p: IconProps) => icn(p, <>
  <Path d="M12 21s-6.5-7-6.5-12a6.5 6.5 0 1 1 13 0c0 5-6.5 12-6.5 12z" />
  <Circle cx="12" cy="9.5" r="2.5" />
</>);

export const IcnRoute = (p: IconProps) => icn(p, <>
  <Circle cx="6" cy="6" r="2.5" />
  <Circle cx="18" cy="18" r="2.5" />
  <Path d="M6 8.5v3a4 4 0 0 0 4 4h4a4 4 0 0 1 4 4" />
</>);

export const IcnCheck = (p: IconProps) => icn(p, <>
  <Polyline points="5 13 10 18 19 7" />
</>);

export const IcnClose = (p: IconProps) => icn(p, <>
  <Line x1="6" y1="6" x2="18" y2="18" />
  <Line x1="18" y1="6" x2="6" y2="18" />
</>);

export const IcnLock = (p: IconProps) => icn(p, <>
  <Rect x="5" y="11" width="14" height="10" rx="2" />
  <Path d="M8 11V8a4 4 0 1 1 8 0v3" />
</>);

export const IcnUnlock = (p: IconProps) => icn(p, <>
  <Rect x="5" y="11" width="14" height="10" rx="2" />
  <Path d="M8 11V8a4 4 0 1 1 7.5-1" />
</>);

export const IcnEye = (p: IconProps) => icn(p, <>
  <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
  <Circle cx="12" cy="12" r="3" />
</>);

export const IcnEyeOff = (p: IconProps) => icn(p, <>
  <Path d="M4 4l16 16" />
  <Path d="M9.5 5.5C10.3 5.2 11.1 5 12 5c6.5 0 10 7 10 7s-1.2 2.4-3.5 4.5" />
  <Path d="M6.5 6.5C3.5 8.5 2 12 2 12s3.5 7 10 7c1.5 0 2.8-.3 4-.8" />
</>);

export const IcnSettings = (p: IconProps) => icn(p, <>
  <Circle cx="12" cy="12" r="3" />
  <Path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
</>);

export const IcnFilter = (p: IconProps) => icn(p, <>
  <Line x1="4" y1="6" x2="20" y2="6" />
  <Line x1="7" y1="12" x2="17" y2="12" />
  <Line x1="10" y1="18" x2="14" y2="18" />
</>);

export const IcnCamera = (p: IconProps) => icn(p, <>
  <Path d="M3 7h4l2-2h6l2 2h4v13H3z" strokeLinejoin="round" />
  <Circle cx="12" cy="13" r="4" />
</>);

export const IcnStar = (p: IconProps) => icn(p, <>
  <Polygon points="12 3 14.5 9 21 9.5 16 14 17.5 21 12 17.5 6.5 21 8 14 3 9.5 9.5 9 12 3" />
</>);

export const IcnStarFill = (p: IconProps) => {
  const { size = 20, color = '#D49B2E' } = p;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <Polygon points="12 3 14.5 9 21 9.5 16 14 17.5 21 12 17.5 6.5 21 8 14 3 9.5 9.5 9 12 3" />
    </Svg>
  );
};

export const IcnFlame = (p: IconProps) => icn(p, <>
  <Path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-9 0 0-4 2-4 6 0-2-1-3-2-4-1 2-3 4-3 7 0 4 3 7 6 7z" />
</>);

export const IcnFlameFill = (p: IconProps) => {
  const { size = 20, color = '#E84C2C' } = p;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-9 0 0-4 2-4 6 0-2-1-3-2-4-1 2-3 4-3 7 0 4 3 7 6 7z" />
    </Svg>
  );
};

export const IcnHeart = (p: IconProps) => icn(p, <>
  <Path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
</>);

export const IcnHeartFill = (p: IconProps) => {
  const { size = 20, color = '#E84C2C' } = p;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <Path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />
    </Svg>
  );
};

export const IcnShare = (p: IconProps) => icn(p, <>
  <Circle cx="6" cy="12" r="2.5" />
  <Circle cx="18" cy="6" r="2.5" />
  <Circle cx="18" cy="18" r="2.5" />
  <Line x1="8" y1="11" x2="16" y2="7" />
  <Line x1="8" y1="13" x2="16" y2="17" />
</>);

export const IcnMessage = (p: IconProps) => icn(p, <>
  <Path d="M4 5h16v12H8l-4 4z" />
</>);

export const IcnCompass = (p: IconProps) => icn(p, <>
  <Circle cx="12" cy="12" r="9" />
  <Polygon points="15 9 10.5 10.5 9 15 13.5 13.5 15 9" />
</>);

export const IcnDots = (p: IconProps) => {
  const { size = 20, color = '#6B655C' } = p;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
      <Circle cx="6" cy="12" r="1.5" />
      <Circle cx="12" cy="12" r="1.5" />
      <Circle cx="18" cy="12" r="1.5" />
    </Svg>
  );
};

export const IcnEdit = (p: IconProps) => icn(p, <>
  <Path d="M14 4l6 6L9 21H3v-6z" />
  <Line x1="13" y1="5" x2="19" y2="11" />
</>);

export const IcnSend = (p: IconProps) => icn(p, <>
  <Line x1="21" y1="3" x2="10" y2="14" />
  <Polygon points="21 3 14 21 10 14 3 10 21 3" />
</>);

export const IcnBolt = (p: IconProps) => icn(p, <>
  <Polygon points="13 3 4 14 11 14 10 21 20 10 13 10 13 3" />
</>);

export const IcnTrophy = (p: IconProps) => icn(p, <>
  <Path d="M7 4h10v6a5 5 0 0 1-10 0V4z" />
  <Path d="M7 6H4v2c0 2.5 2 4 3.5 4M17 6h3v2c0 2.5-2 4-3.5 4" />
  <Path d="M9 19h6M10 14v5M14 14v5" />
</>);

export const IcnMedal = (p: IconProps) => icn(p, <>
  <Circle cx="12" cy="14" r="6" />
  <Path d="M8 14l-3-9 4 1 3-3 3 3 4-1-3 9" />
  <Circle cx="12" cy="14" r="2.5" />
</>);

export const IcnBookmark = (p: IconProps) => icn(p, <>
  <Polygon points="6 4 18 4 18 20 12 16 6 20 6 4" />
</>);

export const IcnSparkle = (p: IconProps) => icn(p, <>
  <Path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6z" />
</>);

export const IcnMic = (p: IconProps) => icn(p, <>
  <Rect x="9" y="3" width="6" height="13" rx="3" />
  <Path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
</>);

export const IcnGlobe = (p: IconProps) => icn(p, <>
  <Circle cx="12" cy="12" r="9" />
  <Line x1="3" y1="12" x2="21" y2="12" />
  <Path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
</>);

export const IcnCrown = (p: IconProps) => icn(p, <>
  <Path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" />
  <Line x1="5" y1="19" x2="19" y2="19" />
</>);

export const IcnCrownFill = (p: IconProps) => {
  const { size = 20, color = '#E84C2C' } = p;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeLinejoin="round" strokeWidth={1.5}>
      <Path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z" />
      <Line x1="5" y1="19" x2="19" y2="19" />
    </Svg>
  );
};

export const IcnShield = (p: IconProps) => icn(p, <>
  <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
</>);

export const IcnShieldFill = (p: IconProps) => {
  const { size = 20, color = '#D49B2E' } = p;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeLinejoin="round" strokeWidth={1.5}>
      <Path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
    </Svg>
  );
};

export const IcnBurst = (p: IconProps) => icn(p, <>
  <Path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
  <Circle cx="12" cy="12" r="4" />
</>);

export const IcnPhone = (p: IconProps) => icn(p, <>
  <Path d="M5 4c0 9 6 15 15 15l1-4-5-1-1 2c-3-1-5-3-6-6l2-1-1-5z" />
</>);

export const IcnPlant = (p: IconProps) => icn(p, <>
  <Path d="M12 22V10M12 14C8 14 5 12 5 8 9 8 12 10 12 14zM12 11c4 0 7-2 7-6-4 0-7 2-7 6z" />
</>);

export const IcnHand = (p: IconProps) => icn(p, <>
  <Path d="M9 12V5a2 2 0 1 1 4 0v6M13 9V4a2 2 0 1 1 4 0v9M17 8V6a2 2 0 1 1 4 0v9c0 3-3 6-7 6s-7-3-7-6v-3a2 2 0 1 1 4 0" />
</>);

export const IcnBook = (p: IconProps) => icn(p, <>
  <Path d="M4 4h7v16H4zM13 4h7v16h-7z" />
</>);

export const IcnSun = (p: IconProps) => icn(p, <>
  <Circle cx="12" cy="12" r="4" />
  <Path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
</>);

export const IcnDroplet = (p: IconProps) => icn(p, <>
  <Path d="M12 3s-7 7-7 12a7 7 0 0 0 14 0c0-5-7-12-7-12z" />
</>);

export const IcnMountain = (p: IconProps) => icn(p, <>
  <Path d="M3 20l6-10 4 6 2-3 6 7H3z" />
</>);

export const IcnTreeOfYears = (p: IconProps) => icn(p, <>
  <Path d="M12 22V13M9 13a3 3 0 0 1 0-6 4 4 0 0 1 6-3 4 4 0 0 1 4 6 3 3 0 0 1-3 6z" />
</>);
