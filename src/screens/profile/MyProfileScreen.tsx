import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar, StoryRing } from '../../components/ui/Avatar';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import {
  IcnShare, IcnSettings, IcnPin, IcnEdit, IcnSparkle,
  IcnFlameFill, IcnCrownFill, IcnShieldFill, IcnBell, IcnCalendar,
} from '../../components/ui/Icons';
import { colors, r, fontSizes, badges as badgeDefs, categories } from '../../tokens';
import type { CategoryKey } from '../../tokens';
import type { MeStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useClubsStore } from '../../store/clubsStore';
import { useEventsStore } from '../../store/eventsStore';

type Props = NativeStackScreenProps<MeStackParamList, 'MyProfile'>;



const EARNED_BADGES = ['ilkAdim', 'cirak', 'sabahci', 'yedi', 'yagmur', 'hazar', 'kitapKurdu', 'kurucu'];

export function MyProfileScreen({ navigation }: Props) {
  const user   = useAuthStore(s => s.user);
  const isGuest = useAuthStore(s => s.isGuest);
  const logout  = useAuthStore(s => s.logout);
  const clubs  = useClubsStore(s => s.clubs);
  const allEvents = useEventsStore(s => s.events);
  const joinedEvents = useEventsStore(s => s.joinedEvents);
  const myClubs = clubs.filter(c => c.myRole !== null);
  const leaderClubs = myClubs.filter(c => c.myRole === 'reis' || c.myRole === 'yardimci');

  // Katıldığın etkinliklerden gerçek istatistikler
  const myEvents = allEvents.filter(e => joinedEvents.includes(e.id));
  const eventCount = myEvents.length || 24; // fallback: demo verisi
  const catCounts = myEvents.reduce<Record<string, number>>((acc, e) => {
    acc[e.cat] = (acc[e.cat] ?? 0) + 1;
    return acc;
  }, {});
  const total = myEvents.length || 24;
  const CAT_DIST: { cat: CategoryKey; v: number; total: number }[] = myEvents.length > 0
    ? (Object.entries(catCounts) as [CategoryKey, number][])
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([cat, v]) => ({ cat, v, total }))
    : [
        { cat: 'yuruyus', v: 11, total: 24 },
        { cat: 'kitap',   v: 6,  total: 24 },
        { cat: 'tenis',   v: 4,  total: 24 },
        { cat: 'satranc', v: 3,  total: 24 },
      ];

  const goToClub = (clubId: string) => {
    (navigation as any).getParent()?.getParent()?.navigate('ClubsTab', {
      screen: 'ClubProfile',
      params: { clubId },
    });
  };

  // Misafir görünümü
  if (isGuest) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF0EE', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 36 }}>👤</Text>
          </View>
          <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['4xl'], color: colors.ink, letterSpacing: -0.3, marginBottom: 10 }}>
            Misafir Modunda
          </Text>
          <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone, textAlign: 'center', lineHeight: fontSizes.lg * 1.55, marginBottom: 28 }}>
            Profilini görmek, etkinliklere katılmak ve cemiyet kurmak için hesap oluştur.
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: colors.ember, borderRadius: r.pill, paddingVertical: 16, paddingHorizontal: 32, shadowColor: colors.ember, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 }}
            onPress={logout}
            activeOpacity={0.85}
          >
            <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'], color: '#fff' }}>
              Giriş Yap / Üye Ol
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.root}>
          {/* Üst bar */}
          <View style={styles.topBar}>
            <Text style={styles.mono}>PROFİL</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('Notifications')}
              >
                <IcnBell size={18} color={colors.ink} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn}>
                <IcnShare size={18} color={colors.ink} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => navigation.navigate('PrivacySettings')}
              >
                <IcnSettings size={18} color={colors.ink} />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.iconBtn, { backgroundColor: '#FFF0EE' }]}
                onPress={() => Alert.alert('Çıkış Yap', 'Hesabından çıkmak istiyor musun?', [
                  { text: 'İptal', style: 'cancel' },
                  { text: 'Çıkış Yap', style: 'destructive', onPress: () => logout() },
                ])}
              >
                <Text style={{ fontSize: 14 }}>↩</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Avatar + isim */}
          <View style={styles.profileHeader}>
            <StoryRing size={104} live>
              {user?.avatarUrl ? (
                <Avatar uri={user.avatarUrl} size={96} tone={user.avatarTone ?? '1'} name={user.name} />
              ) : (
                <LinearGradient
                  colors={[colors.emberGlow, colors.emberDeep]}
                  style={{ flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 52 }}
                >
                  <Text style={{ color: '#fff', fontSize: 38, fontFamily: 'Manrope_800ExtraBold' }}>
                    {user?.name?.charAt(0) ?? 'U'}
                  </Text>
                </LinearGradient>
              )}
            </StoryRing>

            <View style={styles.nameArea}>
              <NameWithBadges name={user?.name ?? '—'} badges={['verified']} size={24} />
              <View style={styles.usernameRow}>
                <Text style={styles.username}>@{user?.username ?? '—'}</Text>
                <View style={styles.dot3} />
                <IcnPin size={12} color={colors.stone} />
                <Text style={styles.username}>Elazığ</Text>
              </View>
            </View>

            {/* Rol şeridi */}
            <View style={styles.roleRow}>
              {leaderClubs.slice(0, 2).map(c => (
                <View key={c.id} style={styles.roleChip}>
                  <View style={[styles.roleIcon, { backgroundColor: c.myRole === 'reis' ? colors.ember : colors.amber }]}>
                    {c.myRole === 'reis'
                      ? <IcnCrownFill size={13} color="#fff" />
                      : <IcnShieldFill size={12} color="#fff" />}
                  </View>
                  <Text style={styles.roleText}>{c.name}</Text>
                </View>
              ))}
              <View style={styles.proBadge}>
                <IcnSparkle size={11} color="#fff" />
                <Text style={styles.proText}>PRO</Text>
              </View>
            </View>

            {/* Bio */}
            <Text style={styles.bio}>
              {user?.bio ?? ''}
            </Text>
          </View>

          {/* Butonlar */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btnDark, { flex: 1 }]}
              onPress={() => navigation.navigate('ProfileEdit')}
              activeOpacity={0.85}
            >
              <IcnEdit size={16} color="#fff" />
              <Text style={styles.btnDarkText}>Profili düzenle</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnGhost} activeOpacity={0.85}>
              <IcnSparkle size={18} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {/* İstatistikler */}
          <View style={styles.statsRow}>
            {([
              { v: String(eventCount), label: 'Etkinlik', color: colors.ember },
              { v: `${eventCount * 3}h`, label: 'Saat', color: colors.forest },
              { v: String(myClubs.length), label: 'Cemiyet', color: colors.ocean },
              { v: '7', label: 'Rozet', color: colors.amber },
            ] as const).map(({ v, label, color }) => (
              <View key={label} style={styles.statCell}>
                <Text style={[styles.statValue, { color }]}>{v}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            ))}
          </View>

          {/* Streak kartı */}
          <LinearGradient
            colors={[colors.ember, '#C03A1F']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.streakCard}
          >
            <View style={styles.streakIcon}>
              <IcnFlameFill size={28} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.streakLabel}>AKTİF SERİ</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <Text style={styles.streakNum}>12</Text>
                <Text style={styles.streakUnit}>hafta üst üste</Text>
              </View>
              <Text style={styles.streakBest}>En uzun seri: 18 hafta</Text>
            </View>
            <View style={styles.streakBg}>
              <IcnFlameFill size={100} color="rgba(255,255,255,0.18)" />
            </View>
          </LinearGradient>

          {/* Aktivite haritası */}
          <View style={styles.activityCard}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>Aktivite haritası</Text>
              <Text style={styles.activityYear}>2026</Text>
            </View>
            <HeatMap />
            <View style={styles.activityStats}>
              {[['12', 'aktif hafta', colors.ember], ['78h', 'toplam', colors.forest], ['3.2h', 'haftalık ort.', colors.ocean]].map(
                ([v, l, c], i) => (
                  <View key={i} style={{ alignItems: 'center' }}>
                    <Text style={{ fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['5xl'], color: c as string, letterSpacing: -0.3 }}>{v}</Text>
                    <Text style={styles.statLabel}>{l}</Text>
                  </View>
                )
              )}
            </View>
          </View>

          {/* Kategori dağılımı */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kategori dağılımı</Text>
            {CAT_DIST.map(({ cat, v, total }) => {
              const def = categories[cat];
              return (
                <View key={cat} style={{ marginBottom: 12 }}>
                  <View style={styles.catDistRow}>
                    <CategoryIcon name={cat} size={22} filled />
                    <Text style={styles.catDistLabel}>{def.label}</Text>
                    <Text style={styles.catDistValue}>{v}</Text>
                  </View>
                  <View style={styles.barBg}>
                    <View style={[styles.bar, { width: `${(v / total) * 100}%`, backgroundColor: def.color }]} />
                  </View>
                </View>
              );
            })}
          </View>

          {/* Cemiyetlerim */}
          <View style={{ marginBottom: 18 }}>
            <View style={styles.rowHeader}>
              <Text style={styles.cardTitle}>Cemiyetlerim</Text>
              <TouchableOpacity
                onPress={() => (navigation as any).getParent()?.getParent()?.navigate('ClubsTab')}
              >
                <Text style={styles.seeAll}>{myClubs.length} →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.clubGrid}>
              {myClubs.slice(0, 4).map((club) => (
                <TouchableOpacity
                  key={club.id}
                  style={styles.clubCell}
                  activeOpacity={0.85}
                  onPress={() => goToClub(club.id)}
                >
                  <CategoryIcon name={club.cat} size={32} filled />
                  <Text style={styles.clubName}>{club.name}</Text>
                  <View style={{ marginTop: 6 }}>
                    <NameWithBadges name="" badges={[club.myRole as any]} size={10} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Son Etkinlikler */}
          {myEvents.length > 0 && (
            <View style={{ marginBottom: 18 }}>
              <View style={styles.rowHeader}>
                <Text style={styles.cardTitle}>Son etkinlikler</Text>
                <Text style={styles.seeAll}>{myEvents.length} →</Text>
              </View>
              <View style={{ gap: 8 }}>
                {myEvents.slice(0, 4).map(ev => (
                  <TouchableOpacity
                    key={ev.id}
                    style={styles.eventRow}
                    activeOpacity={0.85}
                    onPress={() => (navigation as any).getParent()?.getParent()?.navigate('HomeTab', {
                      screen: 'EventDetail', params: { eventId: ev.id },
                    })}
                  >
                    <View style={[styles.eventCatDot, { backgroundColor: categories[ev.cat]?.color ?? colors.ember }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.eventRowTitle} numberOfLines={1}>{ev.title}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <IcnCalendar size={11} color={colors.stone} />
                        <Text style={styles.eventRowMeta}>{ev.date} · {ev.time}</Text>
                      </View>
                    </View>
                    <View style={styles.joinedBadge}>
                      <Text style={styles.joinedText}>Katıldım</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Rozetler */}
          <View style={styles.card}>
            <View style={styles.rowHeader}>
              <View>
                <Text style={styles.cardTitle}>Rozetler</Text>
                <Text style={styles.badgeSub}>7 kazandın · 14'ü ilerlemede</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Tümü →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.badgeGrid}>
              {EARNED_BADGES.map((id) => {
                const def = (badgeDefs as any)[id];
                if (!def) return null;
                return (
                  <View key={id} style={styles.badgeItem}>
                    <View style={[styles.badgeCircle, { backgroundColor: def.color }]} />
                    <Text style={styles.badgeName}>{def.name}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function HeatMap() {
  const colorMap = ['rgba(168,154,142,0.12)', 'rgba(212,155,46,0.45)', 'rgba(232,76,44,0.65)', 'rgba(184,58,32,0.95)'];
  const data = Array.from({ length: 24 }, (_, w) =>
    Array.from({ length: 7 }, (_, d) => {
      const v = Math.sin(w * 0.4 + d * 0.7) * 0.5 + 0.5;
      return w < 16 ? (v > 0.6 ? 3 : v > 0.3 ? 2 : v > 0.1 ? 1 : 0) : 0;
    })
  );
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {data.map((week, w) => (
        <View key={w} style={{ flexDirection: 'column', gap: 3, flex: 1 }}>
          {week.map((v, d) => (
            <View key={d} style={{ height: 10, borderRadius: 2, backgroundColor: colorMap[v] }} />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  root: { padding: 20 },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingBottom: 18,
  },
  mono: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs,
    letterSpacing: 0.6, textTransform: 'uppercase', color: colors.stone,
  },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  profileHeader: { alignItems: 'center', marginBottom: 22 },
  nameArea: { marginTop: 14, alignItems: 'center' },
  usernameRow: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
  },
  username: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone,
  },
  dot3: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.stone2, marginHorizontal: 4 },
  roleRow: { flexDirection: 'row', gap: 8, marginTop: 14, flexWrap: 'wrap', justifyContent: 'center' },
  roleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingVertical: 6, paddingLeft: 6, paddingRight: 12,
    backgroundColor: colors.surface, borderRadius: r.pill,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  roleIcon: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  roleText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ink },
  proBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 4, paddingLeft: 8, paddingRight: 10,
    borderRadius: r.pill, backgroundColor: colors.ember,
  },
  proText: {
    color: '#fff', fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.sm, letterSpacing: 0.4,
  },
  bio: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.ink, marginTop: 14, maxWidth: 280, textAlign: 'center', lineHeight: fontSizes.lg * 1.5,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  btnDark: {
    backgroundColor: colors.ink, borderRadius: r.pill,
    paddingVertical: 14, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  btnDarkText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl },
  btnGhost: {
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ruleStrong,
    borderRadius: r.pill, alignItems: 'center', justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 6, marginBottom: 18 },
  statCell: {
    flex: 1, backgroundColor: colors.surface, borderRadius: r.md,
    padding: 12, alignItems: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  statValue: { fontFamily: 'Manrope_800ExtraBold', fontSize: 22, letterSpacing: -0.3 },
  statLabel: { fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.sm, color: colors.stone, marginTop: 1 },
  streakCard: {
    borderRadius: r.lg, padding: 16, flexDirection: 'row', alignItems: 'center',
    gap: 14, marginBottom: 18, overflow: 'hidden', position: 'relative',
  },
  streakIcon: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  streakLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.8)', letterSpacing: 0.6, textTransform: 'uppercase',
  },
  streakNum: { fontFamily: 'Manrope_800ExtraBold', fontSize: 30, color: '#fff', letterSpacing: -0.4, lineHeight: 32 },
  streakUnit: { fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: '#fff' },
  streakBest: { fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.base, color: 'rgba(255,255,255,0.75)', marginTop: 3 },
  streakBg: { position: 'absolute', right: -10, top: -10 },
  activityCard: {
    backgroundColor: colors.surface, borderRadius: r.md, padding: 16, marginBottom: 18,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 },
  activityTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.xl },
  activityYear: { fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.base, color: colors.stone },
  activityStats: {
    flexDirection: 'row', justifyContent: 'space-around',
    marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.ruleSoft,
  },
  card: {
    backgroundColor: colors.surface, borderRadius: r.md, padding: 16, marginBottom: 18,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  cardTitle: { fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.xl, marginBottom: 14 },
  catDistRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6,
  },
  catDistLabel: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, flex: 1 },
  catDistValue: { fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.lg, color: colors.ink },
  barBg: { height: 6, backgroundColor: colors.bg2, borderRadius: 3, overflow: 'hidden' },
  bar: { height: '100%', borderRadius: 3 },
  rowHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12,
  },
  seeAll: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ember },
  clubGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  clubCell: {
    width: '47%', backgroundColor: colors.surface, borderRadius: r.md, padding: 12,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  clubName: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, marginTop: 8, lineHeight: fontSizes.md * 1.25,
  },
  badgeSub: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.base, color: colors.stone, marginTop: 2 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  badgeItem: { width: 56, alignItems: 'center' },
  badgeCircle: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeName: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xs,
    color: colors.ink, marginTop: 8, textAlign: 'center',
  },
  eventRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, borderRadius: r.md, padding: 12,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  eventCatDot: { width: 10, height: 10, borderRadius: 5 },
  eventRowTitle: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: colors.ink },
  eventRowMeta: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.sm, color: colors.stone },
  joinedBadge: {
    backgroundColor: '#E8F7EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: r.pill,
  },
  joinedText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xs, color: colors.forest },
});
