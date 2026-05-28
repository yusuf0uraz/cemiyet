import React, { useState } from 'react';
import { useNotifStore } from '../../store/notifStore';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnSettings, IcnCalendar, IcnUsers, IcnBell,
  IcnHeart, IcnCheck, IcnBolt, IcnTrophy,
} from '../../components/ui/Icons';
import { Avatar } from '../../components/ui/Avatar';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { MonoLabel } from '../../components/ui/Chip';
import { colors, r, fontSizes } from '../../tokens';
import type { MeStackParamList } from '../../types';

type Props = NativeStackScreenProps<MeStackParamList, 'Notifications'>;

type NotifType = 'event_reminder' | 'member_join' | 'reaction' | 'follow' | 'badge' | 'announcement';

type Notif = {
  id: string;
  type: NotifType;
  actor: string;
  tone: '1' | '2' | '3' | '4' | '5';
  text: string;
  time: string;
  isRead: boolean;
  hasAction?: boolean;
};

const TODAY_NOTIFS: Notif[] = [
  {
    id: '1',
    type: 'event_reminder',
    actor: 'Sistem',
    tone: '1',
    text: 'Akşam Tenis Turnuvası bugün 18:30\'da başlıyor. Hazır mısın?',
    time: '1s önce',
    isRead: false,
    hasAction: true,
  },
  {
    id: '2',
    type: 'member_join',
    actor: 'Kemal Şahin',
    tone: '5',
    text: 'F.Ü. Tenis Kulübü\'ne katılmak için başvurdu.',
    time: '2s önce',
    isRead: false,
    hasAction: true,
  },
  {
    id: '3',
    type: 'reaction',
    actor: 'Selin Yıldız',
    tone: '3',
    text: 'Etkinlik fotoğrafına "Bravo" reaksiyonu verdi.',
    time: '3s önce',
    isRead: false,
  },
  {
    id: '4',
    type: 'follow',
    actor: 'Meryem Aktaş',
    tone: '4',
    text: 'Seni takip etmeye başladı.',
    time: '5s önce',
    isRead: true,
    hasAction: true,
  },
];

const WEEK_NOTIFS: Notif[] = [
  {
    id: '5',
    type: 'badge',
    actor: 'Sistem',
    tone: '2',
    text: '"Tenis Ustası" rozetini kazandın! Profilinde görüntüleyebilirsin.',
    time: '2g önce',
    isRead: true,
  },
  {
    id: '6',
    type: 'announcement',
    actor: 'F.Ü. Tenis Kulübü',
    tone: '1',
    text: 'Duyuru: Bu haftaki turnuva programı güncellendi.',
    time: '3g önce',
    isRead: true,
  },
  {
    id: '7',
    type: 'event_reminder',
    actor: 'Hazar Kitap Cemiyeti',
    tone: '3',
    text: 'Bu haftaki kitap buluşması iptal edildi.',
    time: '4g önce',
    isRead: true,
  },
];

const notifIcon = (type: NotifType) => {
  switch (type) {
    case 'event_reminder': return <IcnCalendar size={16} color={colors.ember} />;
    case 'member_join': return <IcnUsers size={16} color={colors.ocean} />;
    case 'reaction': return <IcnHeart size={16} color={colors.grape} />;
    case 'follow': return <IcnBell size={16} color={colors.forest} />;
    case 'badge': return <IcnTrophy size={16} color={colors.amber} />;
    case 'announcement': return <IcnBolt size={16} color={colors.stone} />;
  }
};

const notifAccent = (type: NotifType) => {
  switch (type) {
    case 'event_reminder': return colors.ember;
    case 'member_join': return colors.ocean;
    case 'reaction': return colors.grape;
    case 'follow': return colors.forest;
    case 'badge': return colors.amber;
    case 'announcement': return colors.stone;
  }
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Az önce';
  if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}s önce`;
  return `${Math.floor(h / 24)}g önce`;
}

export function NotificationsScreen({ navigation }: Props) {
  const storeItems = useNotifStore(s => s.items);
  const markStoreRead = useNotifStore(s => s.markRead);
  const markAllRead = useNotifStore(s => s.markAllRead);
  const [staticRead, setStaticRead] = useState<Set<string>>(new Set());

  const handleMarkRead = (id: string) => {
    if (id.startsWith('notif-')) {
      markStoreRead(id);
    } else {
      setStaticRead(prev => new Set([...prev, id]));
    }
  };

  // notifStore items → Notif shape
  const liveNotifs: Notif[] = storeItems.map(n => ({
    id: n.id,
    type: (n.type === 'event_join' ? 'event_reminder'
         : n.type === 'club_join' ? 'member_join'
         : n.type) as NotifType,
    actor: n.actor,
    tone: n.tone,
    text: n.text,
    time: relativeTime(n.time),
    isRead: n.isRead,
    hasAction: false,
  }));

  const staticToday = TODAY_NOTIFS.map(n => ({
    ...n,
    isRead: n.isRead || staticRead.has(n.id),
  }));
  const staticWeek = WEEK_NOTIFS.map(n => ({
    ...n,
    isRead: n.isRead || staticRead.has(n.id),
  }));

  const totalUnread =
    liveNotifs.filter(n => !n.isRead).length +
    staticToday.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <IcnArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Bildirimler</Text>
          {totalUnread > 0 && (
            <Text style={styles.headerSub}>{totalUnread} yeni bildirim</Text>
          )}
        </View>
        <TouchableOpacity style={styles.backBtn} onPress={markAllRead}>
          <IcnSettings size={20} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Canlı / yeni aktiviteler */}
        {liveNotifs.length > 0 && (
          <>
            <View style={styles.groupHeader}>
              <MonoLabel>YENİ</MonoLabel>
            </View>
            {liveNotifs.map((notif, i) => (
              <Animated.View key={notif.id} entering={FadeInDown.delay(i * 50)}>
                <NotifRow notif={notif} onRead={handleMarkRead} />
              </Animated.View>
            ))}
          </>
        )}

        {/* Bugün */}
        <View style={[styles.groupHeader, liveNotifs.length > 0 && { marginTop: 8 }]}>
          <MonoLabel>BUGÜN</MonoLabel>
        </View>
        {staticToday.map((notif, i) => (
          <Animated.View key={notif.id} entering={FadeInDown.delay((liveNotifs.length + i) * 60)}>
            <NotifRow notif={notif} onRead={handleMarkRead} />
          </Animated.View>
        ))}

        {/* Bu Hafta */}
        <View style={[styles.groupHeader, { marginTop: 8 }]}>
          <MonoLabel>BU HAFTA</MonoLabel>
        </View>
        {staticWeek.map((notif, i) => (
          <Animated.View key={notif.id} entering={FadeInDown.delay((liveNotifs.length + TODAY_NOTIFS.length + i) * 60)}>
            <NotifRow notif={notif} onRead={handleMarkRead} />
          </Animated.View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotifRow({ notif, onRead }: { notif: Notif; onRead: (id: string) => void }) {
  const accent = notifAccent(notif.type);

  return (
    <TouchableOpacity
      style={[styles.notifRow, !notif.isRead && styles.notifUnread]}
      onPress={() => onRead(notif.id)}
      activeOpacity={0.85}
    >
      {/* Unread dot */}
      {!notif.isRead && <View style={[styles.unreadDot, { backgroundColor: accent }]} />}

      {/* Icon badge over avatar area */}
      <View style={styles.avatarWrap}>
        {notif.type === 'event_reminder' || notif.type === 'badge' || notif.type === 'announcement'
          ? (
            <View style={[styles.iconAvatar, { backgroundColor: accent + '20' }]}>
              {notifIcon(notif.type)}
            </View>
          )
          : (
            <View>
              <Avatar name={notif.actor} tone={notif.tone} size={46} />
              <View style={[styles.iconBadge, { backgroundColor: accent }]}>
                {notifIcon(notif.type)}
              </View>
            </View>
          )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[styles.notifText, !notif.isRead && styles.notifTextBold]}>
          {notif.type !== 'event_reminder' && notif.type !== 'badge' && notif.type !== 'announcement' && (
            <Text style={styles.actorName}>{notif.actor} </Text>
          )}
          {notif.text}
        </Text>
        <Text style={styles.notifTime}>{notif.time}</Text>
        {notif.hasAction && notif.type === 'member_join' && (
          <View style={styles.actionRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.forest }]}>
              <IcnCheck size={14} color="#fff" />
              <Text style={styles.actionBtnText}>Onayla</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtnOutline}>
              <Text style={styles.actionBtnOutlineText}>Reddet</Text>
            </TouchableOpacity>
          </View>
        )}
        {notif.hasAction && notif.type === 'follow' && (
          <TouchableOpacity style={styles.followBackBtn}>
            <Text style={styles.followBackText}>Geri Takip Et</Text>
          </TouchableOpacity>
        )}
        {notif.hasAction && notif.type === 'event_reminder' && (
          <TouchableOpacity style={styles.viewBtn}>
            <Text style={styles.viewBtnText}>Etkinliği Gör →</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['4xl'], color: colors.ink, letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 1,
  },
  groupHeader: {
    paddingHorizontal: 20, paddingVertical: 10, backgroundColor: colors.bg,
  },
  notifRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
    position: 'relative',
  },
  notifUnread: { backgroundColor: '#FFF9F7' },
  unreadDot: {
    position: 'absolute', left: 10, top: 22,
    width: 6, height: 6, borderRadius: 3,
  },
  avatarWrap: { position: 'relative' },
  iconAvatar: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  iconBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: colors.bg,
  },
  notifText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.ink, lineHeight: fontSizes.lg * 1.5,
  },
  notifTextBold: { fontFamily: 'Manrope_600SemiBold' },
  actorName: { fontFamily: 'Manrope_700Bold' },
  notifTime: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.sm, color: colors.stone2, marginTop: 3,
  },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: r.pill,
  },
  actionBtnText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
  actionBtnOutline: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: r.pill,
    borderWidth: 1, borderColor: colors.ruleSoft, backgroundColor: colors.surface,
  },
  actionBtnOutlineText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ink },
  followBackBtn: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: colors.ink, paddingHorizontal: 14, paddingVertical: 7, borderRadius: r.pill,
  },
  followBackText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
  viewBtn: { marginTop: 6 },
  viewBtnText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ember },
});
