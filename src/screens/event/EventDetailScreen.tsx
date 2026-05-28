import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnShare, IcnBookmark, IcnCalendar, IcnClock,
  IcnPin, IcnUsers, IcnLock, IcnUnlock, IcnCheck, IcnArrow, IcnBolt,
} from '../../components/ui/Icons';
import { Avatar } from '../../components/ui/Avatar';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import { Chip, MonoLabel } from '../../components/ui/Chip';
import { ReactionBar, ReactionPickerCompact } from '../../components/ui/ReactionBar';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { HomeStackParamList } from '../../types';
import { useEventsStore } from '../../store/eventsStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'EventDetail'>;

const PARTICIPANTS = [
  { name: 'Ahmet K.', tone: '1' as const, role: 'reis' as const },
  { name: 'Selin Y.', tone: '3' as const, role: null },
  { name: 'Burak T.', tone: '2' as const, role: null },
  { name: 'Meryem A.', tone: '4' as const, role: null },
  { name: 'Kemal S.', tone: '5' as const, role: null },
];

const REACTIONS = { bravo: 14, geliyorum: 23, super: 8, tebrik: 5 };

export function EventDetailScreen({ navigation, route }: Props) {
  const eventId = route.params?.eventId ?? 'ev1';
  const events = useEventsStore(s => s.events);
  const bookmarks = useEventsStore(s => s.bookmarks);
  const joinedEvents = useEventsStore(s => s.joinedEvents);
  const toggleBookmark = useEventsStore(s => s.toggleBookmark);
  const toggleJoin = useEventsStore(s => s.toggleJoin);

  const event = events.find(e => e.id === eventId) ?? events[0];
  const saved = bookmarks.includes(eventId);
  const joined = joinedEvents.includes(eventId);
  const [showReactions, setShowReactions] = useState(false);
  const isLive = event?.isLive ?? false;
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    if (!event || isLive) return;
    const months: Record<string, number> = {
      'Oca':0,'Şub':1,'Mar':2,'Nis':3,'May':4,'Haz':5,
      'Tem':6,'Ağu':7,'Eyl':8,'Eki':9,'Kas':10,'Ara':11,
      'Ocak':0,'Şubat':1,'Mart':2,'Nisan':3,'Mayıs':4,'Haziran':5,
      'Temmuz':6,'Ağustos':7,'Eylül':8,'Ekim':9,'Kasım':10,'Aralık':11,
    };

    const calc = () => {
      const now = new Date();
      const [h, m] = (event.time ?? '00:00').split(':').map(Number);
      let target: Date;

      const raw = (event.date ?? '').toLowerCase().trim();
      if (raw.startsWith('bugün') || raw === 'today') {
        target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
      } else if (raw.startsWith('yarın') || raw === 'tomorrow') {
        target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, h, m, 0);
      } else {
        const datePart = event.date.split('·')[0].trim();
        const parts = datePart.split(' ');
        const day = parseInt(parts[0], 10);
        const month = months[parts[1]];
        if (isNaN(day) || month === undefined) { setCountdown(''); return; }
        target = new Date(now.getFullYear(), month, day, h, m, 0);
        if (target < now) target.setFullYear(target.getFullYear() + 1);
      }

      const diff = target.getTime() - now.getTime();
      if (diff <= 0) { setCountdown('Başladı'); return; }

      const totalSec = Math.floor(diff / 1000);
      const days = Math.floor(totalSec / 86400);
      const hrs  = Math.floor((totalSec % 86400) / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;

      if (days > 0) setCountdown(`${days}g ${hrs}s ${mins}dk`);
      else if (hrs > 0) setCountdown(`${hrs}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`);
      else setCountdown(`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`);
    };

    calc();
    const t = setInterval(calc, 1000); // Gerçek zamanlı — her saniye güncelle
    return () => clearInterval(t);
  }, [event?.id]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Hero fotoğraf */}
        <View style={styles.heroWrap}>
          <PhotoSlot uri={event?.photo} height={320} width="100%">
            <LinearGradient
              colors={['transparent', 'rgba(26,24,20,0.85)']}
              style={StyleSheet.absoluteFill}
            />
            {/* Geri + aksiyon butonları */}
            <SafeAreaView edges={['top']} style={styles.heroNav}>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
                <IcnArrowLeft size={20} color={colors.ink} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity style={styles.navBtn}>
                  <IcnShare size={20} color={colors.ink} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn} onPress={() => toggleBookmark(eventId)}>
                  <IcnBookmark size={20} color={saved ? colors.ember : colors.ink} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
            {/* Hero içerik */}
            <View style={styles.heroBottom}>
              <View style={styles.heroCatRow}>
                {event && <CategoryIcon name={event.cat} size={18} filled />}
                <Text style={styles.heroCat}>{event?.cat?.toUpperCase()}</Text>
                <View style={styles.heroDot} />
                <Text style={styles.heroCat}>AÇIK ETKİNLİK</Text>
              </View>
              <Text style={styles.heroTitle}>{event?.title ?? 'Etkinlik'}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ClubProfile', { clubId: event?.clubId ?? 'c1' })}>
                <Text style={styles.heroOrg}>{event?.club} →</Text>
              </TouchableOpacity>
            </View>
          </PhotoSlot>
        </View>

        {/* Geri sayım bandı */}
        <View style={styles.countdownBand}>
          <IcnBolt size={16} color={colors.ember} />
          {isLive ? (
            <Text style={[styles.countdownText, { color: colors.ember, fontFamily: 'Manrope_800ExtraBold' }]}>
              CANLI • Etkinlik devam ediyor
            </Text>
          ) : countdown ? (
            <>
              <Text style={styles.countdownText}>Başlamasına </Text>
              <Text style={[styles.countdownText, { color: colors.ember, fontFamily: 'Manrope_800ExtraBold' }]}>{countdown}</Text>
              <Text style={styles.countdownText}> kaldı</Text>
            </>
          ) : (
            <Text style={styles.countdownText}>{event?.date} · {event?.time}</Text>
          )}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* Meta bilgiler */}
          <View style={styles.metaCard}>
            <View style={styles.metaRow}>
              <IcnCalendar size={18} color={colors.ember} />
              <View>
                <Text style={styles.metaLabel}>TARİH</Text>
                <Text style={styles.metaValue}>{event?.date ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaRow}>
              <IcnClock size={18} color={colors.ember} />
              <View>
                <Text style={styles.metaLabel}>SAAT</Text>
                <Text style={styles.metaValue}>{event?.time ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.metaDivider} />
            <View style={styles.metaRow}>
              <IcnPin size={18} color={colors.ember} />
              <View style={{ flex: 1 }}>
                <Text style={styles.metaLabel}>KONUM</Text>
                <Text style={styles.metaValue}>{event?.place ?? '—'}</Text>
              </View>
            </View>
          </View>

          {/* Etkinlik bilgileri — ücret ve mod */}
          <View style={styles.infoStrip}>
            <View style={[styles.infoChip, { backgroundColor: event?.free ? '#E8F7EE' : '#FFF0EE' }]}>
              <Text style={{ fontSize: 14 }}>{event?.free ? '🆓' : '💰'}</Text>
              <Text style={[styles.infoChipText, { color: event?.free ? colors.forest : colors.ember }]}>
                {event?.free ? 'Ücretsiz' : 'Ücretli'}
              </Text>
            </View>
            <View style={[styles.infoChip, { backgroundColor: '#F0F5FF' }]}>
              <Text style={{ fontSize: 14 }}>👥</Text>
              <Text style={[styles.infoChipText, { color: colors.ocean }]}>
                {(event?.capacity ?? 0) > 0
                  ? `${event?.count}/${event?.capacity} katılımcı`
                  : `${event?.count} katılımcı`}
              </Text>
            </View>
            {(event?.capacity ?? 0) > 0 && (event?.count ?? 0) >= (event?.capacity ?? 0) && (
              <View style={[styles.infoChip, { backgroundColor: '#FFF0EE' }]}>
                <Text style={{ fontSize: 14 }}>🔴</Text>
                <Text style={[styles.infoChipText, { color: colors.ember }]}>Kontenjan doldu</Text>
              </View>
            )}
          </View>

          {/* Katılımcılar */}
          <View style={[styles.sectionHeader, { marginTop: 8 }]}>
            <MonoLabel>KATILIMCILAR</MonoLabel>
            {(event?.capacity ?? 0) > 0 && (
              <Text style={styles.seeAll}>{event?.count}/{event?.capacity} dolu</Text>
            )}
          </View>
          <View style={styles.participantsRow}>
            {/* Avatar placeholder'ları — gerçek katılımcı verisi API'de yok henüz */}
            {Array.from({ length: Math.min(event?.count ?? 0, 5) }).map((_, i) => (
              <View key={i} style={[styles.avatarWrap, { marginLeft: i > 0 ? -12 : 0, zIndex: 10 - i }]}>
                <Avatar tone={String((i % 5) + 1) as any} size={40} name={String(i)} />
              </View>
            ))}
            {(event?.count ?? 0) > 5 && (
              <View style={styles.moreCount}>
                <Text style={styles.moreText}>+{(event?.count ?? 0) - 5}</Text>
              </View>
            )}
            <View style={{ flex: 1 }} />
            <View style={styles.participantMeta}>
              <IcnUsers size={14} color={colors.stone} />
              <Text style={styles.participantMetaText}>{event?.count ?? 0} katılıyor</Text>
            </View>
          </View>

          {/* Organizatör */}
          <View style={[styles.sectionHeader, { marginTop: 16 }]}>
            <MonoLabel>ORGANİZATÖR</MonoLabel>
          </View>
          <View style={styles.orgRow}>
            <Avatar tone="1" size={44} name={event?.club ?? '?'} />
            <View style={{ flex: 1 }}>
              <NameWithBadges name={event?.club ?? '—'} badges={['verified']} size={15} />
              <Text style={styles.orgRole}>{event?.club}</Text>
            </View>
            <TouchableOpacity style={styles.msgBtn}>
              <Text style={styles.msgText}>Mesaj</Text>
            </TouchableOpacity>
          </View>

          {/* Açıklama */}
          <View style={[styles.sectionHeader, { marginTop: 16 }]}>
            <MonoLabel>HAKKINDA</MonoLabel>
          </View>
          <Text style={styles.descText}>
            Her çarşamba akşamı düzenlediğimiz haftalık tenis turnuvasına davetlisiniz. Tüm seviyelere açık olan etkinliğimizde çiftler ve tekler kategorilerinde maçlar yapılmaktadır.{'\n\n'}
            Raket getirmeyi unutmayın, kort ücreti dahildir.
          </Text>

          {/* Foto galerisi önizleme */}
          <View style={[styles.sectionHeader, { marginTop: 16 }]}>
            <MonoLabel>FOTOĞRAFLAR</MonoLabel>
            <Text style={styles.seeAll}>Tümü →</Text>
          </View>
          <View style={styles.photoGrid}>
            {[1, 2, 3].map(i => (
              <PhotoSlot key={i} tone={String(i) as any} height={90} width="31%" style={{ borderRadius: r.md }} />
            ))}
          </View>

          {/* Reaksiyonlar */}
          <View style={{ marginTop: 20, marginBottom: 8 }}>
            <ReactionBar counts={REACTIONS} />
          </View>
          {showReactions && (
            <ReactionPickerCompact onSelect={() => setShowReactions(false)} />
          )}
        </View>
      </ScrollView>

      {/* Alt CTA */}
      <View style={styles.bottomCTA}>
        {isLive ? (
          <TouchableOpacity
            style={[styles.joinBtn, { backgroundColor: colors.forest }]}
            onPress={() => navigation.navigate('CheckIn', { eventId })}
            activeOpacity={0.85}
          >
            <IcnBolt size={18} color="#fff" />
            <Text style={styles.joinText}>CANLI — Katıl</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.joinBtn, joined && styles.joinedBtn]}
            onPress={() => toggleJoin(eventId)}
            activeOpacity={0.85}
          >
            {joined ? (
              <>
                <IcnCheck size={18} color="#fff" />
                <Text style={styles.joinText}>Katılıyorum</Text>
              </>
            ) : (
              <>
                <Text style={styles.joinText}>Katıl</Text>
                <IcnArrow size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrap: { height: 320 },
  heroNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 4,
  },
  navBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center', justifyContent: 'center',
  },
  heroBottom: {
    position: 'absolute', bottom: 20, left: 20, right: 20,
  },
  heroCatRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8,
  },
  heroCat: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs,
    color: 'rgba(255,255,255,0.8)', letterSpacing: 0.5,
  },
  heroDot: {
    width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.5)',
  },
  heroTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: 26,
    color: '#fff', letterSpacing: -0.4, lineHeight: 30,
  },
  heroOrg: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md,
    color: 'rgba(255,255,255,0.75)', marginTop: 4,
  },
  countdownBand: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, backgroundColor: '#FFF5F3', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#FFD9D0',
  },
  countdownText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.md, color: colors.ink,
  },
  metaCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 4,
    marginTop: 20, marginBottom: 4,
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
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    marginTop: 24, marginBottom: 12,
  },
  seeAll: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ember,
  },
  modRow: { flexDirection: 'row', gap: 10 },
  modCard: {
    flex: 1, backgroundColor: colors.surface, borderRadius: r.md,
    padding: 12, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.ruleSoft,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  modSelected: {
    borderColor: colors.forest, backgroundColor: '#F0FAF4',
  },
  modTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ink,
  },
  modDesc: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.sm, color: colors.stone, textAlign: 'center',
  },
  participantsRow: {
    flexDirection: 'row', alignItems: 'center',
  },
  avatarWrap: {},
  moreCount: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.stone3, alignItems: 'center', justifyContent: 'center',
    marginLeft: -12,
  },
  moreText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ink,
  },
  participantMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  participantMetaText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone,
  },
  orgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: r.md, padding: 14,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  orgRole: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 2,
  },
  msgBtn: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ruleSoft,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: r.pill,
  },
  msgText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ink,
  },
  descText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.ink, lineHeight: fontSizes.lg * 1.65,
  },
  photoGrid: { flexDirection: 'row', gap: 8 },
  bottomCTA: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 36,
    backgroundColor: colors.bg,
    borderTopWidth: 1, borderTopColor: colors.ruleSoft,
  },
  joinBtn: {
    backgroundColor: colors.ember, borderRadius: r.pill, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  joinedBtn: { backgroundColor: colors.forest },
  joinText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'] },
  infoStrip: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4,
  },
  infoChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: r.pill,
  },
  infoChipText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md,
  },
});
