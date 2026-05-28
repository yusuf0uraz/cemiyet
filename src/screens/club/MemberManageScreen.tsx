import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnUsers, IcnSettings, IcnCheck,
} from '../../components/ui/Icons';
import { Avatar } from '../../components/ui/Avatar';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import { MonoLabel } from '../../components/ui/Chip';
import { colors, r, fontSizes } from '../../tokens';
import type { ClubStackParamList } from '../../types';
import { useClubsStore } from '../../store/clubsStore';
import { clubsService } from '../../services/clubsService';
import type { ClubMember } from '../../services/clubsService';

type Props = NativeStackScreenProps<ClubStackParamList, 'MemberManage'>;


export function MemberManageScreen({ navigation, route }: Props) {
  const clubId = route.params?.clubId ?? 'c1';
  const clubs = useClubsStore(s => s.clubs);
  const club = clubs.find(c => c.id === clubId) ?? clubs[0];

  const [members, setMembers] = useState<ClubMember[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Array<{
    id: string; user_id: string; name: string; username: string;
    avatar_tone: string; application_note: string; created_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bekleyen' | 'uyeler'>('uyeler');

  useEffect(() => {
    clubsService.getMembers(clubId)
      .then(data => setMembers(data))
      .catch(() => {})
      .finally(() => setLoading(false));

    // Bekleyen başvuruları yükle
    (async () => {
      try {
        const { apiClient } = await import('../../services/apiClient');
        const { data } = await apiClient.get(`/clubs/${clubId}/join-requests`);
        setPendingRequests(data ?? []);
      } catch {}
    })();
  }, [clubId]);

  const handleApprove = async (reqId: string) => {
    try {
      const { apiClient } = await import('../../services/apiClient');
      await apiClient.post(`/clubs/${clubId}/join-requests/${reqId}/approve`);
      setPendingRequests(p => p.filter(r => r.id !== reqId));
    } catch {}
  };

  const handleReject = async (reqId: string) => {
    try {
      const { apiClient } = await import('../../services/apiClient');
      await apiClient.post(`/clubs/${clubId}/join-requests/${reqId}/reject`);
      setPendingRequests(p => p.filter(r => r.id !== reqId));
    } catch {}
  };

  const activeMembers = members.filter(m => ['reis', 'yardimci', 'aza'].includes(m.role));
  const totalCount = members.length;

  const relativeDate = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return 'Bugün';
    if (days < 30) return `${days} gün önce`;
    const months = Math.floor(days / 30);
    return `${months} ay önce`;
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <IcnArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{club?.name ? `${club.name} · Üyeler` : 'Üye Yönetimi'}</Text>
        <TouchableOpacity style={styles.backBtn}>
          <IcnSettings size={20} color={colors.ink} />
        </TouchableOpacity>
      </View>

      {/* Özet istatistik */}
      <View style={styles.summaryBar}>
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryValue, { color: colors.forest }]}>{activeMembers.filter(m => m.role !== 'reis').length}</Text>
          <Text style={styles.summaryLabel}>AZA</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryValue, { color: colors.amber }]}>{activeMembers.filter(m => m.role === 'yardimci').length}</Text>
          <Text style={styles.summaryLabel}>YÖNETİM</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryCell}>
          <Text style={[styles.summaryValue, { color: colors.ocean }]}>{totalCount}</Text>
          <Text style={styles.summaryLabel}>TOPLAM</Text>
        </View>
      </View>

      {/* Tab */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'uyeler' && styles.tabItemActive]}
          onPress={() => setActiveTab('uyeler')}
        >
          <Text style={[styles.tabText, activeTab === 'uyeler' && styles.tabTextActive]}>
            Üyeler
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'bekleyen' && styles.tabItemActive]}
          onPress={() => setActiveTab('bekleyen')}
        >
          <Text style={[styles.tabText, activeTab === 'bekleyen' && styles.tabTextActive]}>
            Bekleyen {pendingRequests.length > 0 ? `(${pendingRequests.length})` : ''}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {loading ? (
          <ActivityIndicator color={colors.ember} style={{ marginTop: 40 }} />
        ) : (
          <>
            {activeTab === 'bekleyen' && (
              pendingRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <IcnUsers size={40} color={colors.stone3} />
                  <Text style={styles.emptyTitle}>Bekleyen başvuru yok</Text>
                  <Text style={styles.emptySub}>Yeni üye talepleri burada görünecek.</Text>
                </View>
              ) : (
                <View style={{ gap: 10 }}>
                  {pendingRequests.map((req, i) => {
                    const tone = (req.avatar_tone as '1'|'2'|'3'|'4'|'5') ?? '1';
                    return (
                      <Animated.View key={req.id} entering={FadeInDown.delay(i * 60)}>
                      <View style={styles.pendingCard}>
                        <Avatar name={req.name} tone={tone} size={46} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.memberName}>{req.name}</Text>
                          <Text style={[styles.metaText, { color: colors.stone }]}>@{req.username}</Text>
                          {!!req.application_note && (
                            <Text style={[styles.metaText, { marginTop: 6, color: colors.ink, lineHeight: 18 }]} numberOfLines={3}>
                              "{req.application_note}"
                            </Text>
                          )}
                          <View style={styles.actionBtns}>
                            <TouchableOpacity style={styles.approveBtn} onPress={() => handleApprove(req.id)}>
                              <IcnCheck size={16} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(req.id)}>
                              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 16, color: colors.stone }}>✕</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                      </Animated.View>
                    );
                  })}
                </View>
              )
            )}

            {activeTab === 'uyeler' && (
              <View>
                {activeMembers.map((member, i) => {
                  const tone = (member.avatar_tone as '1'|'2'|'3'|'4'|'5') ?? '1';
                  return (
                    <Animated.View key={member.id} entering={FadeInDown.delay(i * 60)}>
                    <TouchableOpacity
                      style={styles.activeCard}
                      activeOpacity={0.85}
                      onPress={() => (navigation as any).navigate('OtherProfile', { userId: member.id })}
                    >
                      <Avatar name={member.name} tone={tone} size={46} />
                      <View style={{ flex: 1 }}>
                        <NameWithBadges
                          name={member.name}
                          badges={member.role !== 'aza' ? [member.role] : []}
                          size={15}
                        />
                        <View style={styles.memberMeta}>
                          <Text style={styles.metaText}>{relativeDate(member.joined_at)}</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={e => e.stopPropagation?.()}
                      >
                        <Text style={styles.moreBtnText}>···</Text>
                      </TouchableOpacity>
                    </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  summaryBar: {
    flexDirection: 'row', backgroundColor: colors.surface, paddingVertical: 14,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.ruleSoft,
  },
  summaryCell: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: colors.ruleSoft, marginVertical: 4 },
  summaryValue: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['4xl'], letterSpacing: -0.5,
  },
  summaryLabel: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs, color: colors.stone,
    letterSpacing: 0.3, marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.ruleSoft,
    backgroundColor: colors.surface,
  },
  tabItem: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: colors.ember },
  tabText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.stone,
  },
  tabTextActive: { color: colors.ember, fontFamily: 'Manrope_700Bold' },
  pendingCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 14, marginBottom: 10,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  memberName: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  memberMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  metaText: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.stone3 },
  actionBtns: { flexDirection: 'row', gap: 8 },
  rejectBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.ruleSoft, alignItems: 'center', justifyContent: 'center',
  },
  approveBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.forest,
    alignItems: 'center', justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center', paddingTop: 60, gap: 12,
  },
  emptyTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'], color: colors.ink,
  },
  emptySub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone, textAlign: 'center',
  },
  activeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
  },
  moreBtn: { padding: 8 },
  moreBtnText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.stone },
});
