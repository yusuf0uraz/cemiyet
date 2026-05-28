import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnBolt, IcnMessage, IcnSend, IcnCamera,
  IcnShare,
} from '../../components/ui/Icons';
import { Avatar } from '../../components/ui/Avatar';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import { ReactionBar } from '../../components/ui/ReactionBar';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes } from '../../tokens';
import type { ClubStackParamList } from '../../types';
import { useClubsStore } from '../../store/clubsStore';
import { useAuthStore } from '../../store/authStore';
import { clubsService } from '../../services/clubsService';
import type { WallPost as ApiPost } from '../../services/clubsService';

type Props = NativeStackScreenProps<ClubStackParamList, 'ClubWall'>;

type Post = ApiPost & { localOnly?: boolean };

export function ClubWallScreen({ navigation, route }: Props) {
  const clubId = route.params?.clubId ?? 'c1';
  const clubs = useClubsStore(s => s.clubs);
  const user = useAuthStore(s => s.user);
  const club = clubs.find(c => c.id === clubId) ?? clubs[0];

  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Yönetici mi?
  const isManager = club?.myRole === 'reis' || club?.myRole === 'yardimci';

  useEffect(() => {
    clubsService.getWall(clubId)
      .then(data => setPosts(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clubId]);

  const handlePost = async () => {
    if (!newPost.trim() || sending) return;
    const text = newPost.trim();
    setNewPost('');
    setSending(true);
    // Optimistik — geçici yerel gönderi
    const temp: Post = {
      id: `local-${Date.now()}`,
      club_id: clubId,
      author_id: user?.id ?? '',
      author_name: user?.name ?? 'Sen',
      author_username: user?.username ?? '',
      author_tone: user?.avatarTone ?? '1',
      text,
      is_announcement: false,
      has_photo: false,
      reactions: { bravo: 0, geliyorum: 0, super: 0, tebrik: 0 },
      created_at: new Date().toISOString(),
      localOnly: true,
    };
    setPosts(prev => [temp, ...prev]);
    try {
      const saved = await clubsService.postToWall(clubId, text, isAnnouncement);
      setIsAnnouncement(false);
      setPosts(prev => prev.map(p => p.id === temp.id ? { ...saved } : p));
    } catch {
      // Optimistik gönderi local kalsın
    } finally {
      setSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <IcnArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{club?.name ?? 'Duvar'}</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Gönderi yaz */}
        <TouchableOpacity
          style={styles.composeCard}
          activeOpacity={0.85}
          onPress={() => inputRef.current?.focus()}
        >
          <Avatar name={user?.name ?? 'Sen'} tone={user?.avatarTone ?? '1'} size={40} />
          <View style={[styles.composeBox, { flex: 1 }]}>
            <Text style={styles.composePlaceholder}>
              {newPost.trim() ? newPost : 'Ne paylaşmak istiyorsun?'}
            </Text>
          </View>
          <TouchableOpacity style={styles.photoBtn} onPress={() => inputRef.current?.focus()}>
            <IcnCamera size={18} color={colors.ember} />
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Gönderiler */}
        {loading ? (
          <ActivityIndicator color={colors.ember} style={{ marginTop: 40 }} />
        ) : (
          <View style={{ paddingHorizontal: 16, gap: 12, marginTop: 4 }}>
            {posts.map((post, index) => {
              const tone = (post.author_tone as '1'|'2'|'3'|'4'|'5') ?? '1';
              const relativeTime = (() => {
                const diff = Date.now() - new Date(post.created_at).getTime();
                const m = Math.floor(diff / 60000);
                if (m < 1) return 'Şimdi';
                if (m < 60) return `${m}dk önce`;
                const h = Math.floor(m / 60);
                if (h < 24) return `${h}s önce`;
                return `${Math.floor(h / 24)}g önce`;
              })();
              return (
              <Animated.View key={post.id} entering={FadeInDown.delay(index * 60)}>
              <View style={[styles.postCard, post.is_announcement && styles.announcementCard]}>
                {post.is_announcement && (
                  <View style={styles.announcementBand}>
                    <LinearGradient
                      colors={[colors.ember, '#C03A1F']}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFill}
                    />
                    <IcnBolt size={12} color="#fff" />
                    <Text style={styles.announcementText}>DUYURU</Text>
                  </View>
                )}

                {/* Gönderi üstü */}
                <View style={styles.postHeader}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('OtherProfile', { userId: post.author_id })}
                    activeOpacity={0.85}
                  >
                    <Avatar name={post.author_name} tone={tone} size={40} />
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <NameWithBadges name={post.author_name} badges={[]} size={14} />
                    <Text style={styles.postTime}>{relativeTime}</Text>
                  </View>
                  <TouchableOpacity>
                    <Text style={styles.dotMenu}>···</Text>
                  </TouchableOpacity>
                </View>

                {/* Gönderi içeriği */}
                <Text style={styles.postText}>{post.text}</Text>

                {/* Fotoğraf */}
                {post.has_photo && (
                  <PhotoSlot
                    tone={tone}
                    height={180}
                    width="100%"
                    style={{ borderRadius: r.md, marginTop: 10 }}
                  />
                )}

                {/* Reaksiyonlar + aksiyonlar */}
                <View style={styles.postFooter}>
                  <View style={{ flex: 1 }}>
                    <ReactionBar counts={post.reactions} compact />
                  </View>
                  <View style={styles.footerActions}>
                    <TouchableOpacity style={styles.footerBtn}>
                      <IcnShare size={16} color={colors.stone} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              </Animated.View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Alt - gönderi yaz */}
      <View style={styles.bottomInputWrap}>
        {/* Duyuru toggle — sadece yöneticilere */}
        {isManager && (
          <TouchableOpacity
            style={[styles.announcementToggle, isAnnouncement && { backgroundColor: colors.ember + '15', borderColor: colors.ember }]}
            onPress={() => setIsAnnouncement(v => !v)}
          >
            <IcnBolt size={14} color={isAnnouncement ? colors.ember : colors.stone} />
            <Text style={[styles.announcementToggleText, isAnnouncement && { color: colors.ember }]}>
              {isAnnouncement ? 'Duyuru olarak paylaş' : 'Normal gönderi'}
            </Text>
          </TouchableOpacity>
        )}
        <View style={styles.bottomInput}>
          <Avatar name={user?.name ?? 'Sen'} tone={user?.avatarTone ?? '1'} size={36} />
          <TextInput
            ref={inputRef}
            style={[styles.inputBox, isAnnouncement && { borderWidth: 1, borderColor: colors.ember + '40' }]}
            value={newPost}
            onChangeText={setNewPost}
            placeholder={isAnnouncement ? 'Duyurunuzu yazın...' : 'Cemiyetle paylaş...'}
            placeholderTextColor={colors.stone2}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !newPost.trim() && { opacity: 0.4 }, isAnnouncement && { backgroundColor: colors.ember }]}
            onPress={handlePost}
            disabled={!newPost.trim()}
          >
            <IcnSend size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  composeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
  },
  composeBox: {
    flex: 1, backgroundColor: colors.bg, borderRadius: r.pill,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  composePlaceholder: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone,
  },
  photoBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF5F3',
    alignItems: 'center', justifyContent: 'center',
  },
  postCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 16,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
    overflow: 'hidden',
  },
  announcementCard: {
    borderWidth: 1, borderColor: 'rgba(232,76,44,0.2)',
  },
  announcementBand: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 6, paddingHorizontal: 12, marginBottom: 12,
    marginTop: -16, marginHorizontal: -16, overflow: 'hidden',
  },
  announcementText: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs, color: '#fff', letterSpacing: 0.5,
  },
  postHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  postTime: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 1,
  },
  dotMenu: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.stone, paddingHorizontal: 4,
  },
  postText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.ink,
    lineHeight: fontSizes.lg * 1.65,
  },
  postFooter: {
    flexDirection: 'row', alignItems: 'center', marginTop: 12,
    paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.ruleSoft,
  },
  footerActions: { flexDirection: 'row', gap: 12 },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerBtnText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.md, color: colors.stone,
  },
  bottomInputWrap: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.ruleSoft,
  },
  announcementToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
    borderWidth: 0,
  },
  announcementToggleText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.sm, color: colors.stone,
  },
  bottomInput: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 12, paddingBottom: 28,
  },
  inputBox: {
    flex: 1, backgroundColor: colors.bg, borderRadius: r.pill,
    paddingHorizontal: 16, paddingVertical: 10,
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.ink,
    maxHeight: 80,
  },
  inputPlaceholder: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone,
  },
  sendBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: colors.ember,
    alignItems: 'center', justifyContent: 'center',
  },
});
