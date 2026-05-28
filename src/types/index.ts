// CemiApp · TypeScript Tipleri

import { CategoryKey, ReactionKey } from '../tokens';

// ─── Kullanıcı ────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  avatarTone?: '1' | '2' | '3' | '4' | '5';
  city: string;
  bio?: string;
  verified?: boolean;
  isPro?: boolean;
  badges: string[];
  stats: {
    events: number;
    hours: number;
    clubs: number;
    badgeCount: number;
  };
}

// ─── Cemiyet (Kulüp) ──────────────────────────────────────────
export type ClubRole = 'reis' | 'yardimci' | 'aza';
export type ClubType = 'bireysel' | 'universite' | 'kurumsal' | 'mekan';
export type MembershipModel = 'acik' | 'basvuru' | 'davet';

export interface Club {
  id: string;
  name: string;
  slug: string;
  category: CategoryKey;
  type: ClubType;
  membershipModel: MembershipModel;
  description?: string;
  avatarTone?: '1' | '2' | '3' | '4' | '5';
  logoText?: string;
  city: string;
  verified?: boolean;
  stats: {
    members: number;
    events: number;
    hours: number;
    rating: number;
  };
  management: Array<{
    user: User;
    role: ClubRole;
    since: string;
  }>;
}

// ─── Etkinlik ─────────────────────────────────────────────────
export type EventVisibility = 'acik' | 'yariAcik' | 'kapali';
export type ParticipationMode = 'yarisma' | 'izleyici';

export interface EventParticipationOption {
  mode: ParticipationMode;
  capacity: number | null;
  count: number;
  description: string;
  color: string;
}

export interface Event {
  id: string;
  title: string;
  category: CategoryKey;
  club: Club;
  date: string;
  time: string;
  endTime?: string;
  place: string;
  distance?: string;
  visibility: EventVisibility;
  isFree: boolean;
  isLive?: boolean;
  liveCount?: number;
  participants: User[];
  participantCount: number;
  participationOptions: EventParticipationOption[];
  reactions: Record<ReactionKey, number>;
  tags: string[];
  photoTone?: '1' | '2' | '3' | '4' | '5';
  description?: string;
}

// ─── Story ────────────────────────────────────────────────────
export interface Story {
  id: string;
  club?: Club;
  user?: User;
  seen: boolean;
  live: boolean;
  avatarTone: '1' | '2' | '3' | '4' | '5';
  letter: string;
  name: string;
}

// ─── Bildirim ────────────────────────────────────────────────
export type NotificationType = 'event' | 'club' | 'badge' | 'message' | 'reaction';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  color: string;
}

// ─── Gönderi (Duvar) ─────────────────────────────────────────
export interface WallPost {
  id: string;
  user: User;
  role: ClubRole;
  time: string;
  body: string;
  photos?: string[];
  reactions: Record<ReactionKey, number>;
  commentCount: number;
  isAnnouncement?: boolean;
}

// ─── Navigasyon Tipleri ───────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Splash: undefined;
  Register: undefined;
  SmsVerify: { phone: string };
  ProfileCreate: { phone?: string; firebaseUid?: string } | undefined;
  Interests: { name: string; username: string; bio: string; phone?: string; firebaseUid?: string };
};

export type MainTabParamList = {
  HomeTab: undefined;
  DiscoverTab: undefined;
  MapTab: undefined;
  ClubsTab: undefined;
  MeTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  EventCreate: undefined;
  EventDetail: { eventId: string };
  CheckIn: { eventId: string };
  EventArchive: { eventId: string };
  ClubProfile: { clubId: string };
  ClubWall: { clubId: string };
  MemberManage: { clubId: string };
  OtherProfile: { userId: string };
};

export type DiscoverStackParamList = {
  Discover: undefined;
  Search: undefined;
  Map: undefined;
  EventDetail: { eventId: string };
  ClubProfile: { clubId: string };
};

export type ClubStackParamList = {
  Clubs: undefined;
  ClubCreate: undefined;
  ClubProfile: { clubId: string };
  ClubWall: { clubId: string };
  MemberManage: { clubId: string };
  OtherProfile: { userId: string };
  EventDetail: { eventId: string };
  EventArchive: { eventId: string };
};

export type MapStackParamList = {
  Map: undefined;
  EventDetail: { eventId: string };
  ClubProfile: { clubId: string };
};

export type MeStackParamList = {
  MyProfile: undefined;
  Notifications: undefined;
  PrivacySettings: undefined;
  OtherProfile: { userId: string };
  ProfileEdit: undefined;
  ClubProfile: { clubId: string };
};

export type CreateModalParamList = {
  EventCreate: undefined;
  ClubCreate: undefined;
};
