import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Avatar, StoryRing } from '../../components/ui/Avatar';
import { PhotoSlot } from '../../components/ui/Card';
import { LiveBadge } from '../../components/ui/Chip';
import { CemiAppLogo } from '../../components/ui/CemiAppLogo';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import {
  IcnSearch, IcnBell, IcnPin, IcnEye, IcnArrow,
  IcnFlameFill, IcnChevronRight, IcnPlus, IcnCalendar,
} from '../../components/ui/Icons';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { HomeStackParamList } from '../../types';
import { useEventsStore } from '../../store/eventsStore';
import { useClubsStore } from '../../store/clubsStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>;

const STATIC_STORIES = [
  { id: 'u2',  name: 'Atalay',     tone: '1' as const, live: false, letter: 'A', clubId: null, eventId: null, userId: 'u2' },
  { id: 'u3',  name: 'Koşucular',  tone: '2' as const, live: false, letter: 'K', clubId: null, eventId: null, userId: 'u3' },
];

const FILTERS = [
  { id: 'hepsi',    label: 'Hepsi',       icon: false },
  { id: 'trend',    label: 'Trend',        icon: true  },
  { id: 'ucretsiz', label: 'Ücretsiz',    icon: false },
  { id: 'tenis',    label: 'Tenis',        icon: false },
  { id: 'yuruyus',  label: 'Yürüyüş',    icon: false },
  { id: 'kitap',    label: 'Kitap',        icon: false },
  { id: 'muzik',    label: 'Müzik',       icon: false },
  { id: 'foto',     label: 'Fotoğraf',    icon: false },
];


export function HomeScreen({ navigation }: Props) {
  const [activeFilter, setActiveFilter] = useState('hepsi');
  const feedEvents = useEventsStore(s => s.events);
  const joinedEvents = useEventsStore(s => s.joinedEvents);
  const toggleJoin = useEventsStore(s => s.toggleJoin);
  const fetchEvents = useEventsStore(s => s.fetchEvents);
  const clubs = useClubsStore(s => s.clubs);
  const fetchClubs = useClubsStore(s => s.fetchClubs);
  const myClubs = clubs.filter(c => c.myRole !== null);

  useEffect(() => {
    fetchEvents();
    fetchClubs();
  }, []);

  const filteredEvents = feedEvents.filter(ev => {
    if (activeFilter === 'hepsi') return true;
    if (activeFilter === 'trend') return ev.count > 15;
    if (activeFilter === 'ucretsiz') return ev.free;
    return ev.cat === activeFilter;
  });

  const liveEvent = feedEvents.find(e => e.isLive);
  const myClub = myClubs[0] ?? null;
  const myClubEvent = myClub ? feedEvents.find(e => e.clubId === myClub.id) : null;

  // Stories: önce üyesi olduğun cemiyetler (canlı olanlar başa), sonra statik kullanıcı hikayeleri
  const clubStories = myClubs.slice(0, 5).map(c => {
    const liveEv = feedEvents.find(e => e.clubId === c.id && e.isLive);
    return {
      id: `club-${c.id}`,
      name: c.name.split(' ').slice(0, 2).join(' '),
      tone: '1' as const,
      live: !!liveEv,
      letter: c.name.charAt(0),
      clubId: c.id,
      eventId: liveEv?.id ?? null,
      userId: null as string | null,
    };
  }).sort((a, b) => (b.live ? 1 : 0) - (a.live ? 1 : 0));
  const allStories = [...clubStories, ...STATIC_STORIES];

  const goToNotifications = () => {
    (navigation as any).getParent()?.getParent()?.navigate('MeTab', {
      screen: 'Notifications',
    });
  };

  const goToSearch = () => {
    (navigation as any).getParent()?.getParent()?.navigate('DiscoverTab', {
      screen: 'Search',
    });
  };

  const goToCreate = () => {
    (navigation as any).getParent()?.getParent()?.navigate('DiscoverTab');
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* Üst çubuk */}
        <SafeAreaView edges={['top']} style={styles.topBar}>
          <View style={styles.topLeft}>
            <CemiAppLogo size={32} />
            <View>
              <Text style={styles.cityText}>📍 Elazığ</Text>
              <Text style={styles.cityCount}>{feedEvents.length} etkinlik bugün</Text>
            </View>
          </View>
          <View style={styles.topActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={goToSearch}>
              <IcnSearch size={20} color={colors.ink} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { position: 'relative' }]}
              onPress={goToNotifications}
            >
              <IcnBell size={20} color={colors.ink} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Stories — takip edilen cemiyetlerin canlı anları */}
        <View style={styles.storiesSection}>
          <Text style={styles.storiesLabel}>● CANLI ANLAR · TAKİP ETTİKLERİN</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {/* Etkinlik oluştur kısayolu */}
            <TouchableOpacity
              style={styles.storyItem}
              onPress={() => navigation.navigate('EventCreate')}
              activeOpacity={0.85}
            >
              <View style={styles.addStory}>
                <IcnPlus size={22} color={colors.ember} />
              </View>
              <Text style={styles.storyName}>Etkinlik{'\n'}oluştur</Text>
            </TouchableOpacity>

            {allStories.map((s, i) => (
              <Animated.View key={s.id} entering={FadeIn.delay(i * 60)}>
              <TouchableOpacity
                style={styles.storyItem}
                activeOpacity={0.85}
                onPress={() => {
                  if (s.live && s.eventId) {
                    navigation.navigate('CheckIn', { eventId: s.eventId });
                  } else if (s.userId) {
                    navigation.navigate('OtherProfile', { userId: s.userId });
                  } else if (s.clubId) {
                    navigation.navigate('ClubProfile', { clubId: s.clubId });
                  }
                }}
              >
                <StoryRing size={64} live={s.live}>
                  <Avatar size={64} tone={s.tone} text={s.letter} />
                </StoryRing>
                <Text style={styles.storyName} numberOfLines={1}>{s.name}</Text>
              </TouchableOpacity>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* Hero başlık */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            Bugün şehrinde{'\n'}
            <Text style={{ color: colors.ember }}>{feedEvents.length} olay var.</Text>
          </Text>

          {/* Hızlı filtreler */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 16 }} contentContainerStyle={{ paddingRight: 20 }}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(f.id)}
              >
                {f.icon && <IcnFlameFill size={14} color={activeFilter === f.id ? '#fff' : colors.ember} />}
                <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* CANLI etkinlik */}
        {liveEvent && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <LiveBadge />
              <Text style={styles.sectionTitle}>Şu anda devam edenler</Text>
            </View>
            <TouchableOpacity
              style={[styles.card, { overflow: 'hidden' }]}
              activeOpacity={0.92}
              onPress={() => navigation.navigate('CheckIn', { eventId: liveEvent.id })}
            >
              <PhotoSlot uri={liveEvent.photo} tone="2" height={170}>
                <View style={styles.photoOverlayTop}>
                  <View style={styles.catChipBlur}>
                    <CategoryIcon name={liveEvent.cat} size={22} filled />
                    <Text style={styles.catChipText}>{(categories as any)[liveEvent.cat]?.label ?? liveEvent.cat}</Text>
                  </View>
                  <LiveBadge label={`${liveEvent.count} KİŞİ CANLI`} />
                </View>
                <View style={styles.photoThumbRow}>
                  {(['1','3','5'] as const).map((t, i) => (
                    <PhotoSlot key={i} tone={t} height={36} width={36}
                      style={{ borderRadius: 8, borderWidth: 2, borderColor: '#fff' }} />
                  ))}
                  <View style={styles.moreThumb}>
                    <Text style={styles.moreThumbText}>+{Math.max(0, liveEvent.count - 3)}</Text>
                  </View>
                </View>
              </PhotoSlot>
              <View style={styles.cardBody}>
                <Text style={styles.eventTitle}>{liveEvent.title}</Text>
                <TouchableOpacity
                  style={styles.clubRow}
                  onPress={() => navigation.navigate('ClubProfile', { clubId: liveEvent.clubId })}
                  hitSlop={{ top: 8, bottom: 8 }}
                >
                  <Avatar size={20} tone="1" text={liveEvent.club[0]} />
                  <Text style={styles.clubText}>{liveEvent.club} · {liveEvent.count}/{liveEvent.capacity}</Text>
                  <IcnChevronRight size={14} color={colors.stone} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.liveBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('CheckIn', { eventId: liveEvent.id })}
                >
                  <IcnEye size={16} color="#fff" />
                  <Text style={styles.liveBtnText}>Canlı anları gör</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Etkinlikler */}
        <View style={styles.section}>
          <View style={styles.sectionHeader2}>
            <Text style={styles.sectionH2}>
              {activeFilter === 'hepsi' ? 'Etkinlikler' :
               activeFilter === 'ucretsiz' ? 'Ücretsiz' :
               activeFilter === 'trend' ? 'Trend' :
               (categories as any)[activeFilter]?.label ?? 'Etkinlikler'}
            </Text>
            <TouchableOpacity onPress={goToSearch}>
              <Text style={styles.seeAll}>Tümünü gör →</Text>
            </TouchableOpacity>
          </View>
          {filteredEvents.filter(ev => !ev.isLive).map((ev, index) => (
            <Animated.View key={ev.id} entering={FadeInDown.delay(index * 80).springify()}>
              <EventCard
                eventId={ev.id}
                cat={ev.cat}
                title={ev.title}
                club={ev.club}
                clubId={ev.clubId}
                date={ev.date}
                time={ev.time}
                place={ev.place}
                count={ev.count}
                capacity={ev.capacity}
                photo={ev.photo}
                free={ev.free}
                isJoined={joinedEvents.includes(ev.id)}
                onPress={() => navigation.navigate('EventDetail', { eventId: ev.id })}
                onClubPress={() => navigation.navigate('ClubProfile', { clubId: ev.clubId })}
                onJoinPress={() => toggleJoin(ev.id)}
              />
            </Animated.View>
          ))}
        </View>

        {/* Cemiyetinden — takip edilen cemiyetin yaklaşan etkinliği */}
        {myClub && (
          <View style={styles.section}>
            <View style={styles.sectionHeader2}>
              <Text style={styles.sectionH2}>Cemiyetinden</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ClubWall', { clubId: myClub.id })}>
                <Text style={styles.seeAll}>Duvara git →</Text>
              </TouchableOpacity>
            </View>
            {myClubEvent ? (
              <TouchableOpacity
                style={[styles.card, { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }]}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('EventDetail', { eventId: myClubEvent.id })}
              >
                <CategoryIcon name={myClubEvent.cat} size={48} filled />
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>{myClubEvent.date} · {myClubEvent.time}</Text>
                  <Text style={styles.miniEventTitle}>{myClubEvent.title}</Text>
                  <Text style={styles.miniClub}>{myClub.name}</Text>
                </View>
                <IcnChevronRight size={20} color={colors.stone} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.card, { padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 12 }]}
                activeOpacity={0.88}
                onPress={() => navigation.navigate('ClubProfile', { clubId: myClub.id })}
              >
                <CategoryIcon name={myClub.cat} size={48} filled />
                <View style={{ flex: 1 }}>
                  <Text style={styles.metaLabel}>CEMİYET</Text>
                  <Text style={styles.miniEventTitle}>{myClub.name}</Text>
                  <Text style={styles.miniClub}>{myClub.memberCount} üye</Text>
                </View>
                <IcnChevronRight size={20} color={colors.stone} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Katıldığın etkinlikler — arşiv */}
        {joinedEvents.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader2}>
              <Text style={styles.sectionH2}>Katıldıklarım</Text>
              <TouchableOpacity onPress={goToSearch}>
                <Text style={styles.seeAll}>Tümü →</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {feedEvents.filter(e => joinedEvents.includes(e.id)).slice(0, 5).map((ev, i) => (
                <TouchableOpacity
                  key={ev.id}
                  style={styles.archiveCard}
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('EventArchive', { eventId: ev.id })}
                >
                  <PhotoSlot uri={ev.photo} tone={String((i % 5) + 1) as any} height={120} width={150} style={{ borderRadius: r.md }}>
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.65)']}
                      style={[StyleSheet.absoluteFill, { borderRadius: r.md }]}
                    />
                    <View style={styles.archiveOverlay}>
                      <Text style={styles.archiveDate}>{ev.date}</Text>
                      <Text style={styles.archiveTitle}>{ev.title}</Text>
                    </View>
                  </PhotoSlot>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

// ─── EventCard ────────────────────────────────────────────────
interface EventCardProps {
  eventId: string;
  cat: string;
  title: string;
  club: string;
  clubId: string;
  date: string;
  time: string;
  place: string;
  count: number;
  capacity: number;
  photo?: string;
  tone?: '1' | '2' | '3' | '4' | '5';
  free?: boolean;
  isJoined: boolean;
  onPress: () => void;
  onClubPress: () => void;
  onJoinPress: () => void;
}

function EventCard({ eventId, cat, title, club, clubId, date, time, place, count, capacity, photo, tone = '1', free, isJoined, onPress, onClubPress, onJoinPress }: EventCardProps) {
  return (
    <TouchableOpacity style={[styles.card, { overflow: 'hidden', marginBottom: 16 }]} onPress={onPress} activeOpacity={0.92}>
      <PhotoSlot uri={photo} tone={tone} height={195}>
        <View style={styles.photoOverlayTop}>
          <View style={styles.catChipBlur}>
            <CategoryIcon name={cat as any} size={24} filled />
            <Text style={styles.catChipText}>{(categories as any)[cat]?.label ?? cat}</Text>
          </View>
          {free && (
            <View style={styles.freeChip}>
              <Text style={styles.freeText}>ÜCRETSİZ</Text>
            </View>
          )}
        </View>
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.72)']}
          style={styles.photoGradient}
        >
          <Text style={styles.overDate}>{date} · {time}</Text>
          <Text style={styles.overTitle}>{title}</Text>
        </LinearGradient>
      </PhotoSlot>
      <View style={styles.cardMeta}>
        <TouchableOpacity style={styles.cardMetaLeft} onPress={onClubPress} hitSlop={{ top: 6, bottom: 6 }}>
          <Avatar size={30} tone={tone} text={club[0]} />
          <View style={{ flex: 1, minWidth: 0 }}>
            <NameWithBadges name={club} badges={['verified']} size={13} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <IcnPin size={11} color={colors.stone} />
              <Text style={styles.placeText} numberOfLines={1}>{place}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.cardMetaRight}>
          <Text style={styles.countText}>
            {count}
            {capacity > 0 && <Text style={styles.countTotal}>/{capacity}</Text>}
          </Text>
          <Text style={styles.countLabel}>{capacity > 0 ? 'katılıyor' : 'kişi'}</Text>
        </View>
        <TouchableOpacity
          style={[styles.quickJoinBtn, isJoined && styles.quickJoinBtnActive]}
          onPress={e => { e.stopPropagation?.(); onJoinPress(); }}
          activeOpacity={0.85}
        >
          <Text style={[styles.quickJoinText, isJoined && { color: colors.forest }]}>
            {isJoined ? '✓ Katıldım' : 'Katıl'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 12,
    backgroundColor: 'rgba(247,241,227,0.96)',
  },
  topLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cityText: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone },
  cityCount: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.base, color: colors.stone2 },
  topActions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4, backgroundColor: colors.ember, borderWidth: 2, borderColor: colors.surface,
  },
  storiesSection: { padding: 20, paddingBottom: 14 },
  storiesLabel: { fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs, letterSpacing: 0.6, color: colors.stone },
  storyItem: { alignItems: 'center', marginRight: 14, flexShrink: 0, maxWidth: 72 },
  addStory: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface,
    borderWidth: 2, borderStyle: 'dashed', borderColor: colors.ember + '80',
    alignItems: 'center', justifyContent: 'center',
  },
  storyName: { fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.sm, marginTop: 6, color: colors.ink, textAlign: 'center' },
  heroSection: { paddingHorizontal: 20, paddingTop: 8 },
  heroTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.display,
    color: colors.ink, lineHeight: fontSizes.display * 1.02, letterSpacing: -0.8,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 8, paddingHorizontal: 14,
    backgroundColor: colors.surface, borderRadius: r.pill, marginRight: 8,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  filterChipActive: { backgroundColor: colors.ink },
  filterText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ink },
  filterTextActive: { color: '#fff' },
  section: { paddingHorizontal: 20, paddingTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionHeader2: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes['5xl'] },
  sectionH2: { fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['6xl'], letterSpacing: -0.4 },
  seeAll: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ember },
  card: {
    backgroundColor: colors.surface, borderRadius: r.lg,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 16, elevation: 6,
  },
  photoOverlayTop: {
    position: 'absolute', top: 12, left: 12, right: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2,
  },
  catChipBlur: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(0,0,0,0.42)', paddingVertical: 6, paddingHorizontal: 10, paddingLeft: 6, borderRadius: r.pill,
  },
  catChipText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
  freeChip: { backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 5, paddingHorizontal: 10, borderRadius: r.pill },
  freeText: { color: colors.forest, fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.sm },
  photoThumbRow: { position: 'absolute', bottom: 12, left: 12, flexDirection: 'row', gap: 4, zIndex: 2 },
  moreThumb: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff',
  },
  moreThumbText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes.base },
  cardBody: { padding: 14 },
  eventTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['5xl'],
    color: colors.ink, letterSpacing: -0.3, lineHeight: fontSizes['5xl'] * 1.2,
  },
  clubRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  clubText: { flex: 1, fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone },
  liveBtn: {
    backgroundColor: colors.ember, borderRadius: r.pill, paddingVertical: 13, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  liveBtnText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg },
  cardMeta: { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardMetaLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 0 },
  cardMetaRight: { alignItems: 'flex-end' },
  placeText: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.base, color: colors.stone },
  countText: { fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.xl, color: colors.ink },
  countTotal: { color: colors.stone2 },
  countLabel: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs,
    letterSpacing: 0.8, color: colors.stone, textTransform: 'uppercase',
  },
  photoGradient: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    paddingTop: 40, paddingHorizontal: 16, paddingBottom: 16,
  },
  overDate: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.base,
    color: 'rgba(255,255,255,0.85)', letterSpacing: 0.4, textTransform: 'uppercase',
  },
  overTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: 22,
    color: '#fff', marginTop: 4, lineHeight: 22 * 1.15, letterSpacing: -0.3,
  },
  metaLabel: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs, letterSpacing: 0.6, color: colors.stone,
  },
  miniEventTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes['3xl'], color: colors.ink, marginTop: 2,
  },
  miniClub: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 4 },
  archiveCard: {},
  archiveOverlay: { position: 'absolute', bottom: 8, left: 8, right: 8 },
  archiveDate: { fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.7)' },
  archiveTitle: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: '#fff', marginTop: 2 },
  quickJoinBtn: {
    backgroundColor: colors.ember, paddingHorizontal: 16, paddingVertical: 9, borderRadius: r.pill,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 6, elevation: 4,
  },
  quickJoinBtnActive: {
    backgroundColor: '#E8F7EE', shadowOpacity: 0,
  },
  quickJoinText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff',
  },
});
