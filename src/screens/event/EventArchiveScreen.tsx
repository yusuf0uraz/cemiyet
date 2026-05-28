import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnShare, IcnCalendar, IcnClock, IcnPin,
  IcnCamera, IcnTrophy, IcnHeart,
} from '../../components/ui/Icons';
import { Avatar } from '../../components/ui/Avatar';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import { MonoLabel } from '../../components/ui/Chip';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes } from '../../tokens';
import type { HomeStackParamList } from '../../types';
import { useEventsStore } from '../../store/eventsStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'EventArchive'>;

const GALLERY_PHOTOS: Array<{ tone: '1'|'2'|'3'|'4'|'5'; span: 'wide'|'normal' }> = [
  { tone: '1', span: 'wide' },
  { tone: '2', span: 'normal' },
  { tone: '3', span: 'normal' },
  { tone: '4', span: 'normal' },
  { tone: '5', span: 'normal' },
  { tone: '1', span: 'wide' },
];

const PARTICIPANTS = [
  { name: 'Ahmet K.', tone: '1' as const },
  { name: 'Selin Y.', tone: '3' as const },
  { name: 'Burak T.', tone: '2' as const },
  { name: 'Meryem A.', tone: '4' as const },
];

const STATS = [
  { label: 'KATILIMCI', value: '22', color: colors.ember },
  { label: 'FOTOĞRAF', value: '47', color: colors.ocean },
  { label: 'SAAT', value: '2.5', color: colors.forest },
  { label: 'REAKSİYON', value: '134', color: colors.grape },
];

export function EventArchiveScreen({ navigation, route }: Props) {
  const eventId = route.params?.eventId ?? '';
  const events = useEventsStore(s => s.events);
  const event = events.find(e => e.id === eventId) ?? events[0];

  // Etkinliğin cemiyetine ait son duvar gönderileri
  const [wallPosts, setWallPosts] = useState<Array<{
    id: string; author_name: string; author_tone: string; text: string; created_at: string;
  }>>([]);

  useEffect(() => {
    if (event?.clubId) {
      import('../../services/clubsService').then(({ clubsService }) => {
        clubsService.getWall(event.clubId, { limit: 5 })
          .then(posts => setWallPosts(posts.slice(0, 5)))
          .catch(() => {});
      });
    }
  }, [event?.clubId]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={{ height: 260 }}>
          <PhotoSlot tone="1" height={260} width="100%">
            <LinearGradient
              colors={['transparent', 'rgba(26,24,20,0.92)']}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroNav}>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
                <IcnArrowLeft size={20} color={colors.ink} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navBtn}>
                <IcnShare size={20} color={colors.ink} />
              </TouchableOpacity>
            </SafeAreaView>
            <View style={styles.heroBottom}>
              <View style={styles.archivePill}>
                <IcnCalendar size={12} color="rgba(255,255,255,0.7)" />
                <Text style={styles.archivePillText}>ARŞİV · {event?.date ?? '15 Mayıs 2026'}</Text>
              </View>
              <Text style={styles.heroTitle}>{event?.title ?? 'Etkinlik Arşivi'}</Text>
              <View style={styles.heroMeta}>
                <CategoryIcon name={event?.cat ?? 'tenis'} size={16} filled />
                <Text style={styles.heroMetaText}>{event?.club ?? 'Cemiyet'}</Text>
              </View>
            </View>
          </PhotoSlot>
        </View>

        {/* İstatistik band */}
        <View style={styles.statsBand}>
          {STATS.map(({ label, value, color }, i) => (
            <React.Fragment key={label}>
              {i > 0 && <View style={styles.statsDivider} />}
              <View style={styles.statCell}>
                <Text style={[styles.statValue, { color }]}>{value}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Etkinlik detayları */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <IcnCalendar size={18} color={colors.ember} />
              <View>
                <Text style={styles.metaLabel}>TARİH</Text>
                <Text style={styles.metaValue}>{event?.date ?? '15 Mayıs 2026'}</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaRow}>
              <IcnClock size={18} color={colors.ember} />
              <View>
                <Text style={styles.metaLabel}>SAAT</Text>
                <Text style={styles.metaValue}>{event?.time ?? '18:30'}</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaRow}>
              <IcnPin size={18} color={colors.ember} />
              <View>
                <Text style={styles.metaLabel}>KONUM</Text>
                <Text style={styles.metaValue}>{event?.place ?? 'Elazığ'}</Text>
              </View>
            </View>
          </View>

          {/* Kazananlar / Öne Çıkanlar */}
          <View style={styles.sectionHeader}>
            <IcnTrophy size={16} color={colors.amber} />
            <MonoLabel style={{ color: colors.amber }}>TURNUVA SONUÇLARI</MonoLabel>
          </View>
          <View style={styles.winnersCard}>
            <View style={styles.winnerRow}>
              <View style={[styles.rankBadge, { backgroundColor: '#D4AF37' }]}>
                <Text style={styles.rankText}>1</Text>
              </View>
              <Avatar name="Ahmet K." tone="1" size={40} />
              <View style={{ flex: 1 }}>
                <NameWithBadges name="Ahmet Kaya" badges={['verified']} size={14} />
                <Text style={styles.winnerScore}>6-3, 6-4</Text>
              </View>
              <Text style={styles.winnerTag}>ŞAMPİYON</Text>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.winnerRow}>
              <View style={[styles.rankBadge, { backgroundColor: '#A8A9AD' }]}>
                <Text style={styles.rankText}>2</Text>
              </View>
              <Avatar name="Burak T." tone="2" size={40} />
              <View style={{ flex: 1 }}>
                <Text style={styles.winnerName}>Burak Toprak</Text>
                <Text style={styles.winnerScore}>3-6, 4-6</Text>
              </View>
              <Text style={[styles.winnerTag, { color: colors.stone }]}>FİNALİST</Text>
            </View>
          </View>

          {/* Katılımcılar */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <MonoLabel>KATILIMCILAR ({PARTICIPANTS.length}+)</MonoLabel>
          </View>
          <View style={styles.participantsRow}>
            {PARTICIPANTS.map(({ name, tone }, i) => (
              <View key={i} style={[{ marginLeft: i > 0 ? -10 : 0, zIndex: 10 - i }]}>
                <Avatar name={name} tone={tone} size={40} />
              </View>
            ))}
            <View style={styles.moreCount}>
              <Text style={styles.moreText}>+18</Text>
            </View>
          </View>

          {/* Fotoğraf galerisi */}
          <View style={[styles.sectionHeader, { marginTop: 20 }]}>
            <IcnCamera size={16} color={colors.stone} />
            <MonoLabel>47 FOTOĞRAF</MonoLabel>
            <Text style={styles.seeAll}>Tümü →</Text>
          </View>
          <View style={styles.gallery}>
            {GALLERY_PHOTOS.slice(0, 2).map((p, i) => (
              <Animated.View key={i} entering={FadeIn.delay(i * 80)}>
                <PhotoSlot
                  tone={p.tone}
                  height={180}
                  width={i === 0 ? '100%' : '100%'}
                  style={{ borderRadius: r.md, width: i === 0 ? 220 : 110 }}
                />
              </Animated.View>
            ))}
          </View>
          <View style={[styles.gallery, { marginTop: 8 }]}>
            {GALLERY_PHOTOS.slice(2, 6).map((p, i) => (
              <Animated.View key={i} entering={FadeIn.delay((i + 2) * 80)} style={{ position: 'relative' }}>
                <PhotoSlot
                  tone={p.tone}
                  height={100}
                  style={{ borderRadius: r.md, width: i === 3 ? 100 : 85 }}
                />
                {i === 3 && (
                  <View style={styles.moreOverlay}>
                    <Text style={styles.moreOverlayText}>+43</Text>
                  </View>
                )}
              </Animated.View>
            ))}
          </View>

          {/* Cemiyet yorumları */}
          {wallPosts.length > 0 && (
            <View style={{ marginTop: 20, marginBottom: 8 }}>
              <View style={[styles.sectionHeader, { marginBottom: 10 }]}>
                <IcnHeart size={16} color={colors.stone} />
                <MonoLabel>CEMİYET YORUMLARI</MonoLabel>
              </View>
              {wallPosts.map((post, i) => {
                const tone = (post.author_tone as '1'|'2'|'3'|'4'|'5') ?? '1';
                const diff = Date.now() - new Date(post.created_at).getTime();
                const h = Math.floor(diff / 3600000);
                const d = Math.floor(diff / 86400000);
                const timeStr = d > 0 ? `${d}g önce` : `${h}s önce`;
                return (
                  <Animated.View key={post.id} entering={FadeIn.delay(i * 60)}>
                  <View style={styles.commentRow}>
                    <Avatar name={post.author_name} tone={tone} size={36} />
                    <View style={styles.commentBubble}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ink }}>{post.author_name}</Text>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: fontSizes.sm, color: colors.stone2 }}>{timeStr}</Text>
                      </View>
                      <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.ink, lineHeight: fontSizes.lg * 1.5 }}>{post.text}</Text>
                    </View>
                  </View>
                  </Animated.View>
                );
              })}
            </View>
          )}

          {/* Anı bırak */}
          <View style={styles.memoryCard}>
            <LinearGradient
              colors={[colors.ember, '#C03A1F']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <IcnHeart size={22} color="rgba(255,255,255,0.7)" />
            <View style={{ flex: 1 }}>
              <Text style={styles.memoryTitle}>Anında katıldın!</Text>
              <Text style={styles.memorySub}>Bu etkinlik profilinde arşivlendi.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  heroNav: {
    flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 4,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
  },
  archivePill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: r.pill, alignSelf: 'flex-start', marginBottom: 8,
  },
  archivePillText: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.8)',
  },
  heroTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: 26,
    color: '#fff', letterSpacing: -0.4, lineHeight: 30,
  },
  heroMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6,
  },
  heroMetaText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: 'rgba(255,255,255,0.75)',
  },
  statsBand: {
    flexDirection: 'row', backgroundColor: colors.surface, paddingVertical: 14,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statsDivider: { width: 1, backgroundColor: colors.ruleSoft, marginVertical: 4 },
  statValue: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['4xl'], letterSpacing: -0.5,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs, color: colors.stone,
    letterSpacing: 0.3, marginTop: 2,
  },
  metaCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 4,
    marginTop: 20,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14, paddingHorizontal: 16,
  },
  metaDivider: { height: 1, backgroundColor: colors.ruleSoft, marginHorizontal: 16 },
  metaLabel: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: 9, color: colors.stone,
    letterSpacing: 0.5, marginBottom: 2,
  },
  metaValue: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.ink,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 24, marginBottom: 12,
  },
  winnersCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 4,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  winnerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16,
  },
  rankBadge: {
    width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
  },
  rankText: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.md, color: '#fff',
  },
  winnerName: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: colors.ink,
  },
  winnerScore: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.sm, color: colors.stone, marginTop: 2,
  },
  winnerTag: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs,
    color: colors.amber, letterSpacing: 0.5,
  },
  participantsRow: { flexDirection: 'row', alignItems: 'center' },
  moreCount: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.stone3, alignItems: 'center', justifyContent: 'center', marginLeft: -10,
  },
  moreText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ink,
  },
  seeAll: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ember, marginLeft: 'auto',
  },
  gallery: { flexDirection: 'row', gap: 8 },
  moreOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(26,24,20,0.6)', borderRadius: r.md,
    alignItems: 'center', justifyContent: 'center',
  },
  moreOverlayText: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['4xl'], color: '#fff',
  },
  memoryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    borderRadius: r.lg, padding: 16, marginTop: 24, overflow: 'hidden',
  },
  memoryTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.xl, color: '#fff',
  },
  memorySub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: 'rgba(255,255,255,0.8)', marginTop: 2,
  },
  commentRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 10 },
  commentBubble: {
    flex: 1, backgroundColor: colors.surface, borderRadius: r.md, padding: 12,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
});
