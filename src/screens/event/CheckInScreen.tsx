import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnCamera, IcnUsers, IcnClock, IcnSend,
  IcnHeart, IcnHeartFill, IcnFlame, IcnFlameFill, IcnBolt, IcnCheck,
} from '../../components/ui/Icons';
import { pickImageOrCamera } from '../../hooks/useImagePicker';
import { Avatar } from '../../components/ui/Avatar';
import { LiveBadge } from '../../components/ui/Chip';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes } from '../../tokens';
import type { HomeStackParamList } from '../../types';
import { useEventsStore } from '../../store/eventsStore';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<HomeStackParamList, 'CheckIn'>;

const LIVE_PHOTOS = [
  { tone: '1' as const, user: 'Ahmet K.', time: '2dk' },
  { tone: '3' as const, user: 'Selin Y.', time: '5dk' },
  { tone: '2' as const, user: 'Burak T.', time: '8dk' },
  { tone: '4' as const, user: 'Meryem A.', time: '12dk' },
];

const MOMENTS = [
  { user: 'Ahmet K.', tone: '1' as const, text: 'Harika bir başlangıç! 🎾', time: '14:32' },
  { user: 'Selin Y.', tone: '3' as const, text: 'Set sayısı 2-1 oldu.', time: '14:45' },
  { user: 'Burak T.', tone: '2' as const, text: 'Final başlıyor!', time: '15:10' },
];

export function CheckInScreen({ navigation, route }: Props) {
  const eventId = (route.params as any)?.eventId ?? 'ev1';
  const events = useEventsStore(s => s.events);
  const user = useAuthStore(s => s.user);
  const event = events.find(e => e.id === eventId) ?? events[0];

  const [liked, setLiked] = useState(false);
  const [flamed, setFlamed] = useState(false);
  const [comment, setComment] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);
  const [myPhotos, setMyPhotos] = useState<string[]>([]);
  const [moments, setMoments] = useState<Array<{ user: string; tone: '1'|'2'|'3'|'4'|'5'; text: string; time: string }>>(MOMENTS);

  const handleCheckIn = async () => {
    const uri = await pickImageOrCamera();
    if (uri) {
      setMyPhotos(prev => [uri, ...prev]);
      setCheckedIn(true);
    }
  };

  const handleSend = () => {
    if (!comment.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
    setMoments(prev => [...prev, {
      user: user?.name?.split(' ')[0] ?? 'Sen',
      tone: user?.avatarTone ?? '1',
      text: comment.trim(),
      time,
    }]);
    setComment('');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.night }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <IcnArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.titleArea}>
            <LiveBadge />
            <Text style={styles.eventTitle}>{event?.title ?? 'Canlı Etkinlik'}</Text>
          </View>
          <View style={styles.attendCount}>
            <IcnUsers size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.attendText}>{event?.count ?? 0}</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Ana fotoğraf - canlı akış */}
        <View style={styles.mainPhotoWrap}>
          <PhotoSlot tone="1" height={280} width="100%">
            <LinearGradient
              colors={['transparent', 'rgba(14,11,8,0.9)']}
              style={StyleSheet.absoluteFill}
            />
            {/* Üst sağ - süre */}
            <View style={styles.durationBadge}>
              <IcnClock size={12} color="#fff" />
              <Text style={styles.durationText}>1s 24dk</Text>
            </View>
            {/* Alt - anlık tepkiler */}
            <View style={styles.mainPhotoBottom}>
              <View style={styles.reactionRow}>
                <TouchableOpacity
                  style={[styles.reactBtn, liked && styles.reactBtnActive]}
                  onPress={() => setLiked(v => !v)}
                >
                  {liked
                    ? <IcnHeartFill size={18} color={colors.ember} />
                    : <IcnHeart size={18} color="#fff" />}
                  <Text style={styles.reactCount}>47</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.reactBtn, flamed && styles.reactBtnActive]}
                  onPress={() => setFlamed(v => !v)}
                >
                  {flamed
                    ? <IcnFlameFill size={18} color={colors.amber} />
                    : <IcnFlame size={18} color="#fff" />}
                  <Text style={styles.reactCount}>23</Text>
                </TouchableOpacity>
              </View>
            </View>
          </PhotoSlot>
        </View>

        {/* Fotoğraf akışı - yatay */}
        <Animated.View entering={FadeInDown.delay(60)}>
        <View style={styles.photoStreamHeader}>
          <Text style={styles.photoStreamTitle}>Anlar</Text>
          <TouchableOpacity style={styles.addPhotoBtn} onPress={handleCheckIn}>
            <IcnCamera size={16} color={colors.ember} />
            <Text style={styles.addPhotoText}>{checkedIn ? '✓ Check-in yapıldı' : 'Check-in & Fotoğraf'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoStream}
        >
          {/* Kendi yüklediğin fotoğraflar */}
          {myPhotos.map((uri, i) => (
            <TouchableOpacity key={`my-${i}`} style={styles.streamPhotoWrap} activeOpacity={0.9}>
              <PhotoSlot uri={uri} tone="1" height={140} width={105} style={{ borderRadius: r.md }}>
                <LinearGradient colors={['transparent', 'rgba(14,11,8,0.75)']} style={[StyleSheet.absoluteFill, { borderRadius: r.md }]} />
                <View style={styles.streamPhotoMeta}>
                  <Text style={styles.streamPhotoUser}>Sen</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                    <IcnCheck size={10} color={colors.ember} />
                    <Text style={[styles.streamPhotoTime, { color: colors.ember }]}>Check-in</Text>
                  </View>
                </View>
              </PhotoSlot>
            </TouchableOpacity>
          ))}

          {LIVE_PHOTOS.map(({ tone, user: photoUser, time }, i) => (
            <TouchableOpacity key={i} style={styles.streamPhotoWrap} activeOpacity={0.9}>
              <PhotoSlot tone={tone} height={140} width={105} style={{ borderRadius: r.md }}>
                <LinearGradient
                  colors={['transparent', 'rgba(14,11,8,0.75)']}
                  style={[StyleSheet.absoluteFill, { borderRadius: r.md }]}
                />
                <View style={styles.streamPhotoMeta}>
                  <Text style={styles.streamPhotoUser}>{photoUser}</Text>
                  <Text style={styles.streamPhotoTime}>{time} önce</Text>
                </View>
              </PhotoSlot>
            </TouchableOpacity>
          ))}
          {/* Fotoğraf ekle kartı */}
          <TouchableOpacity style={styles.addPhotoCard} activeOpacity={0.85} onPress={handleCheckIn}>
            <LinearGradient
              colors={[colors.ember, '#C03A1F']}
              style={[StyleSheet.absoluteFill, { borderRadius: r.md }]}
            />
            <IcnCamera size={28} color="#fff" />
            <Text style={styles.addPhotoCardText}>Senin{'\n'}anın</Text>
          </TouchableOpacity>
        </ScrollView>
        </Animated.View>

        {/* Moment yorumları */}
        <Animated.View entering={FadeInDown.delay(120)}>
        <View style={styles.momentsHeader}>
          <IcnBolt size={16} color={colors.amber} />
          <Text style={styles.momentsTitle}>ANLARA YORUM YAP</Text>
        </View>
        <View style={styles.momentsList}>
          {moments.map(({ user: mUser, tone, text, time }, i) => (
            <View key={i} style={styles.momentRow}>
              <Avatar name={mUser} tone={tone} size={36} />
              <View style={styles.momentBubble}>
                <View style={styles.momentMeta}>
                  <Text style={styles.momentUser}>{mUser}</Text>
                  <Text style={styles.momentTime}>{time}</Text>
                </View>
                <Text style={styles.momentText}>{text}</Text>
              </View>
            </View>
          ))}
        </View>
        </Animated.View>
      </ScrollView>

      {/* Alt - mesaj gönder */}
      <View style={styles.bottomInput}>
        <View style={styles.inputRow}>
          <Avatar name={user?.name ?? 'Sen'} tone={user?.avatarTone ?? '1'} size={32} />
          <TextInput
            style={styles.inputBox}
            value={comment}
            onChangeText={setComment}
            placeholder="Bir şey yaz..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !comment.trim() && { opacity: 0.4 }]}
            onPress={handleSend}
            disabled={!comment.trim()}
          >
            <IcnSend size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  titleArea: { flex: 1, gap: 4 },
  eventTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: '#fff',
  },
  attendCount: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: r.pill,
  },
  attendText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: 'rgba(255,255,255,0.8)',
  },
  mainPhotoWrap: { height: 280 },
  durationBadge: {
    position: 'absolute', top: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: r.pill,
  },
  durationText: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.sm, color: '#fff',
  },
  mainPhotoBottom: {
    position: 'absolute', bottom: 14, left: 14,
  },
  reactionRow: { flexDirection: 'row', gap: 10 },
  reactBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: r.pill,
  },
  reactBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  reactCount: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff',
  },
  photoStreamHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
  },
  photoStreamTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['5xl'], color: '#fff',
  },
  addPhotoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(232,76,44,0.2)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: r.pill,
  },
  addPhotoText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ember,
  },
  photoStream: { paddingHorizontal: 16, gap: 10 },
  streamPhotoWrap: {},
  streamPhotoMeta: {
    position: 'absolute', bottom: 8, left: 8,
  },
  streamPhotoUser: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.sm, color: '#fff',
  },
  streamPhotoTime: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.7)',
  },
  addPhotoCard: {
    width: 105, height: 140, borderRadius: r.md,
    alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden',
  },
  addPhotoCardText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff', textAlign: 'center',
  },
  momentsHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12,
  },
  momentsTitle: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs,
    color: colors.amber, letterSpacing: 0.5,
  },
  momentsList: { paddingHorizontal: 16, gap: 12 },
  momentRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  momentBubble: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: r.md, padding: 12,
  },
  momentMeta: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4,
  },
  momentUser: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff',
  },
  momentTime: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs, color: 'rgba(255,255,255,0.4)',
  },
  momentText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: 'rgba(255,255,255,0.9)',
  },
  bottomInput: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 12, paddingBottom: 28,
    backgroundColor: 'rgba(14,11,8,0.95)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputBox: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: r.pill,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  inputPlaceholder: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: 'rgba(255,255,255,0.35)',
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.ember,
    alignItems: 'center', justifyContent: 'center',
  },
});
