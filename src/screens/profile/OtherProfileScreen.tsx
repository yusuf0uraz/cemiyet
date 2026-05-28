import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnShare, IcnMessage, IcnLock, IcnCheck,
} from '../../components/ui/Icons';
import { Avatar } from '../../components/ui/Avatar';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import { MonoLabel } from '../../components/ui/Chip';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { HomeStackParamList } from '../../types';
import { useClubsStore } from '../../store/clubsStore';
import { useToastStore } from '../../store/toastStore';
import { useNotifStore } from '../../store/notifStore';
import { followsService } from '../../services/followsService';
import { usersService, type PublicUser } from '../../services/usersService';

type Props = NativeStackScreenProps<HomeStackParamList, 'OtherProfile'>;

type UserSeed = {
  name: string;
  username: string;
  tone: '1' | '2' | '3' | '4' | '5';
  bio: string;
  badges: string[];
  cats: Array<{ key: 'tenis' | 'kitap' | 'yuruyus' | 'foto' | 'doga'; count: number }>;
  eventCount: number;
  followerCount: number;
  gradientColors: [string, string];
};

const USER_SEEDS: Record<string, UserSeed> = {
  default: {
    name: 'Kemal Şahin',
    username: 'kemal.sahin',
    tone: '5',
    bio: 'Tenis ve kitap aşığı. F.Ü. Tenis Kulübü reisi. Hazar\'da sabah koşuları.',
    badges: ['verified', 'reis'],
    cats: [{ key: 'tenis', count: 48 }, { key: 'kitap', count: 24 }, { key: 'yuruyus', count: 18 }],
    eventCount: 48,
    followerCount: 127,
    gradientColors: [categories.tenis.color, colors.ember],
  },
  u2: {
    name: 'Fatma Demir',
    username: 'fatma.demir',
    tone: '3',
    bio: 'Kitap kurdu, fotoğraf meraklısı. Şehrin dört bir yanını keşfediyorum.',
    badges: ['verified'],
    cats: [{ key: 'kitap', count: 35 }, { key: 'foto', count: 22 }, { key: 'doga', count: 10 }],
    eventCount: 35,
    followerCount: 89,
    gradientColors: [categories.kitap.color, '#6B3FA0'],
  },
  u3: {
    name: 'Ozan Yılmaz',
    username: 'ozan.yilmaz',
    tone: '2',
    bio: 'Doğa yürüyüşleri ve fotoğrafçılık. Hazar Gölü\'nü çok seviyorum.',
    badges: [],
    cats: [{ key: 'yuruyus', count: 29 }, { key: 'foto', count: 15 }, { key: 'doga', count: 12 }],
    eventCount: 29,
    followerCount: 64,
    gradientColors: [categories.yuruyus.color, categories.doga.color],
  },
};

const MUTUAL_FRIENDS = [
  { name: 'Selin Y.', tone: '3' as const },
  { name: 'Burak T.', tone: '2' as const },
  { name: 'Meryem A.', tone: '4' as const },
];

export function OtherProfileScreen({ navigation, route }: Props) {
  const userId = route.params?.userId ?? '';
  const seedProfile = USER_SEEDS[userId] ?? USER_SEEDS.default;

  const [apiUser, setApiUser] = useState<PublicUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const clubs = useClubsStore(s => s.clubs);

  const [following, setFollowing] = useState(false);
  const showToast = useToastStore(s => s.show);
  const addNotif = useNotifStore(s => s.add);
  const isPrivate = false;

  useEffect(() => {
    if (!userId) { setLoadingUser(false); return; }
    Promise.allSettled([
      usersService.getProfile(userId).then(setApiUser),
      followsService.getStatus(userId).then(({ following: f }) => setFollowing(f)),
    ]).finally(() => setLoadingUser(false));
  }, [userId]);

  // API verisi gelince onu, yoksa seed kullan
  const profile = apiUser ? {
    name: apiUser.name,
    username: apiUser.username,
    tone: (apiUser.avatar_tone as '1'|'2'|'3'|'4'|'5') ?? '1',
    avatarUrl: (apiUser as any).avatar_url as string | undefined,
    bio: apiUser.bio ?? '',
    badges: apiUser.verified ? ['verified'] : [],
    cats: seedProfile.cats,
    eventCount: apiUser.event_count ?? 0,
    followerCount: apiUser.follower_count ?? 0,
    gradientColors: seedProfile.gradientColors,
  } : seedProfile;

  // Ortak kulübümüz var mı?
  const sharedClubs = clubs.slice(0, 3);

  const handleFollow = useCallback(() => {
    const next = !following;
    setFollowing(next);
    if (next) {
      showToast(`@${profile.username} takip edildi`, 'success', '✓');
      addNotif({
        type: 'follow',
        actor: profile.name,
        tone: profile.tone,
        text: `@${profile.username} kişisini takip etmeye başladın.`,
        accent: '#2E7DD8',
      });
    } else {
      showToast(`@${profile.username} takipten çıkarıldı`, 'info', '👋');
    }
    followsService.toggle(userId).catch(() => {
      setFollowing(!next);
    });
  }, [following, profile.username, userId]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header görseli */}
        <View style={{ height: 160 }}>
          <LinearGradient
            colors={profile.gradientColors}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          />
          <SafeAreaView edges={['top']} style={styles.heroNav}>
            <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
              <IcnArrowLeft size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn}>
              <IcnShare size={20} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Profil kimliği */}
        <Animated.View entering={FadeInDown.delay(60)} style={styles.identitySection}>
          <View style={styles.avatarAbsolute}>
            <Avatar name={profile.name} tone={profile.tone} size={80} />
          </View>
          <View style={styles.identityContent}>
            <NameWithBadges name={profile.name} badges={profile.badges as any} size={20} />
            <Text style={styles.username}>@{profile.username}</Text>
            <Text style={styles.bio}>{profile.bio}</Text>

            {/* Ortak arkadaşlar */}
            <View style={styles.mutualsRow}>
              {MUTUAL_FRIENDS.map(({ name, tone }, i) => (
                <View key={i} style={[{ marginLeft: i > 0 ? -8 : 0 }]}>
                  <Avatar name={name} tone={tone} size={24} />
                </View>
              ))}
              <Text style={styles.mutualsText}>  Selin, Burak ve 3 ortak arkadaş</Text>
            </View>
          </View>

          {/* Aksiyonlar */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.followBtn, following && styles.followingBtn]}
              onPress={handleFollow}
              activeOpacity={0.85}
            >
              {following
                ? <><IcnCheck size={14} color={colors.ink} /><Text style={[styles.followText, { color: colors.ink }]}>Takip</Text></>
                : <Text style={styles.followText}>+ Takip Et</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.msgBtn}>
              <IcnMessage size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* İstatistikler */}
        <Animated.View entering={FadeInDown.delay(120)}>
        <View style={styles.statsRow}>
          {[
            { label: 'ETKİNLİK', value: String(profile.eventCount), color: colors.ember },
            { label: 'TAKİPÇİ', value: String(apiUser?.follower_count ?? profile.followerCount), color: colors.ocean },
            { label: 'CEMİYET', value: String(apiUser?.club_count ?? sharedClubs.length), color: colors.forest },
          ].map(({ label, value, color }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={styles.statsDivider} />}
              <View style={styles.statCell}>
                <Text style={[styles.statValue, { color }]}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>
        </Animated.View>

        {isPrivate ? (
          <View style={styles.privateState}>
            <IcnLock size={36} color={colors.stone3} />
            <Text style={styles.privateTitle}>Gizli Profil</Text>
            <Text style={styles.privateSub}>Takip et ve içerikleri gör.</Text>
          </View>
        ) : (
          <View style={{ paddingHorizontal: 20 }}>
            {/* Cemiyetler */}
            <Animated.View entering={FadeInDown.delay(180)}>
            <View style={styles.sectionHeader}>
              <MonoLabel>CEMİYETLER</MonoLabel>
            </View>
            <View style={styles.clubsRow}>
              {sharedClubs.map((club, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.clubChip}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('ClubProfile', { clubId: club.id })}
                >
                  <CategoryIcon name={club.cat} size={18} filled />
                  <Text style={styles.clubChipText}>{club.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            </Animated.View>

            {/* Kategori dağılımı */}
            <Animated.View entering={FadeInDown.delay(240)}>
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <MonoLabel>ETKİNLİK KATEGORİLERİ</MonoLabel>
            </View>
            <View style={styles.catBars}>
              {profile.cats.map(({ key, count }) => {
                const def = categories[key];
                const total = profile.cats.reduce((a, c) => a + c.count, 0);
                const pct = Math.round((count / total) * 100);
                return (
                  <View key={key} style={styles.catBarRow}>
                    <CategoryIcon name={key} size={16} />
                    <Text style={styles.catBarLabel}>{def.label}</Text>
                    <View style={styles.catBarTrack}>
                      <View style={[styles.catBarFill, { width: `${pct}%`, backgroundColor: def.color }]} />
                    </View>
                    <Text style={styles.catBarPct}>{count}</Text>
                  </View>
                );
              })}
            </View>
            </Animated.View>

            {/* Son etkinlikler - foto grid */}
            <Animated.View entering={FadeInDown.delay(300)}>
            <View style={[styles.sectionHeader, { marginTop: 20 }]}>
              <MonoLabel>SON ETKİNLİKLER</MonoLabel>
            </View>
            <View style={styles.photoGrid}>
              {[1, 2, 3, 4, 5, 6].map(i => (
                <PhotoSlot
                  key={i}
                  tone={String(((i - 1) % 5) + 1) as any}
                  height={100}
                  width="31%"
                  style={{ borderRadius: r.sm }}
                />
              ))}
            </View>
            </Animated.View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroNav: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 4,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center',
  },
  identitySection: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 },
  avatarAbsolute: {
    position: 'absolute', top: -40, left: 20,
    borderWidth: 4, borderColor: colors.bg, borderRadius: 44,
  },
  identityContent: { marginTop: 12 },
  username: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 2,
  },
  bio: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.ink, lineHeight: fontSizes.lg * 1.55, marginTop: 8,
  },
  mutualsRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 10,
  },
  mutualsText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone,
  },
  actionRow: {
    flexDirection: 'row', gap: 10, marginTop: 16,
  },
  followBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    backgroundColor: colors.ember, paddingVertical: 12, borderRadius: r.pill,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  followingBtn: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ruleSoft,
  },
  followText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: '#fff' },
  msgBtn: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ruleSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row', backgroundColor: colors.surface, paddingVertical: 14,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.ruleSoft,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statsDivider: { width: 1, backgroundColor: colors.ruleSoft, marginVertical: 4 },
  statValue: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['4xl'], letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs,
    color: colors.stone, letterSpacing: 0.3, marginTop: 2,
  },
  privateState: {
    alignItems: 'center', paddingTop: 60, gap: 12,
  },
  privateTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'], color: colors.ink,
  },
  privateSub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone,
  },
  sectionHeader: {
    marginTop: 20, marginBottom: 12,
  },
  clubsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clubChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, borderRadius: r.pill,
    paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 1, borderColor: colors.ruleSoft,
  },
  clubChipText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.md, color: colors.ink,
  },
  catBars: { gap: 10 },
  catBarRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  catBarLabel: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.md, color: colors.ink, width: 60,
  },
  catBarTrack: {
    flex: 1, height: 6, backgroundColor: colors.stone3, borderRadius: 3,
  },
  catBarFill: { height: '100%', borderRadius: 3 },
  catBarPct: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.sm, color: colors.stone, width: 28,
    textAlign: 'right',
  },
  photoGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 4,
  },
});
