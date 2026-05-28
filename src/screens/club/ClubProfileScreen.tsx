import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnShare, IcnUsers, IcnCalendar, IcnSettings,
  IcnBolt, IcnPin, IcnCheck, IcnCrown,
} from '../../components/ui/Icons';
import { Avatar } from '../../components/ui/Avatar';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import { Chip, MonoLabel } from '../../components/ui/Chip';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { ClubStackParamList } from '../../types';
import { useClubsStore } from '../../store/clubsStore';
import { useEventsStore } from '../../store/eventsStore';
import { clubsService } from '../../services/clubsService';
import type { ClubMember } from '../../services/clubsService';
import { eventsService } from '../../services/eventsService';
import { JoinApplicationModal } from '../../components/ui/JoinApplicationModal';

type Props = NativeStackScreenProps<ClubStackParamList, 'ClubProfile'>;



export function ClubProfileScreen({ navigation, route }: Props) {
  const clubId = route.params?.clubId ?? 'c1';
  const clubs = useClubsStore(s => s.clubs);
  const joinClub = useClubsStore(s => s.joinClub);
  const leaveClub = useClubsStore(s => s.leaveClub);
  const allEvents = useEventsStore(s => s.events);
  const club = clubs.find(c => c.id === clubId) ?? clubs[0];
  const isMember = club?.myRole !== null;
  const isPending = !isMember && club?.joinStatus === 'bekliyor';
  const [activeTab, setActiveTab] = useState<'etkinlikler' | 'duvar' | 'uyeler'>('etkinlikler');
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [clubApiEvents, setClubApiEvents] = useState<typeof allEvents>([]);
  const [joinModalVisible, setJoinModalVisible] = useState(false);

  // Store'daki + API'den gelen etkinlikleri birleştir
  const storeEvents = allEvents.filter(e => e.clubId === clubId);
  const clubEvents = clubApiEvents.length > 0 ? clubApiEvents : storeEvents;
  const management = members.filter(m => m.role === 'reis' || m.role === 'yardimci');

  useEffect(() => {
    clubsService.getMembers(clubId).then(setMembers).catch(() => {});
    // Bu kulübe ait etkinlikleri çek
    eventsService.getEvents({ club_id: clubId })
      .then(data => setClubApiEvents(data))
      .catch(() => {});
  }, [clubId]);

  const handleTabChange = (tab: 'etkinlikler' | 'duvar' | 'uyeler') => {
    if (tab === 'duvar') {
      navigation.navigate('ClubWall', { clubId });
      return;
    }
    setActiveTab(tab);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <JoinApplicationModal
        visible={joinModalVisible}
        clubName={club?.name ?? ''}
        membershipModel={club?.membershipModel ?? 'acik'}
        onConfirm={async (note) => {
          setJoinModalVisible(false);
          await joinClub(clubId, note);
        }}
        onCancel={() => setJoinModalVisible(false)}
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <View style={{ height: 240 }}>
          <PhotoSlot uri={club?.photo} height={240} width="100%">
            <LinearGradient
              colors={['transparent', 'rgba(26,24,20,0.88)']}
              style={StyleSheet.absoluteFill}
            />
            <SafeAreaView edges={['top']} style={styles.heroNav}>
              <TouchableOpacity style={styles.navBtn} onPress={() => navigation.goBack()}>
                <IcnArrowLeft size={20} color={colors.ink} />
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => navigation.navigate('MemberManage', { clubId })}
                >
                  <IcnSettings size={20} color={colors.ink} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.navBtn}>
                  <IcnShare size={20} color={colors.ink} />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </PhotoSlot>
        </View>

        {/* Kulüp kimliği */}
        <View style={styles.identityRow}>
          <View style={styles.clubAvatarWrap}>
            {club && <CategoryIcon name={club.cat} size={40} filled />}
          </View>
          <View style={{ flex: 1 }}>
            <NameWithBadges name={club?.name ?? '—'} badges={['verified']} size={18} />
            <View style={styles.clubMeta}>
              <IcnPin size={13} color={colors.stone} />
              <Text style={styles.clubMetaText}>Elazığ, Türkiye</Text>
              <View style={styles.dot} />
              <Text style={styles.clubMetaText}>
                {club?.membershipModel === 'onay' ? 'Onaylı Üyelik' :
                 club?.membershipModel === 'kapali' ? 'Kapalı' : 'Herkese Açık'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.followBtn,
              isMember && styles.followingBtn,
              isPending && { backgroundColor: colors.stone3, borderColor: colors.stone2 },
            ]}
            onPress={() => {
              if (isMember) leaveClub(clubId);
              else if (!isPending) setJoinModalVisible(true);
            }}
            activeOpacity={0.85}
            disabled={isPending}
          >
            {isMember
              ? <><IcnCheck size={14} color={colors.ink} /><Text style={[styles.followText, { color: colors.ink }]}>Üye</Text></>
              : isPending
              ? <Text style={[styles.followText, { color: colors.stone }]}>⏳ Bekliyor</Text>
              : <Text style={styles.followText}>+ Katıl</Text>}
          </TouchableOpacity>
        </View>

        {/* İstatistikler */}
        <View style={styles.statsRow}>
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: colors.ember }]}>{club?.memberCount ?? '—'}</Text>
            <Text style={styles.statLabel}>ÜYE</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: colors.ocean }]}>{clubEvents.length}</Text>
            <Text style={styles.statLabel}>ETKİNLİK</Text>
          </View>
          <View style={styles.statsDivider} />
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: colors.forest }]}>{management.length}</Text>
            <Text style={styles.statLabel}>YÖNETİM</Text>
          </View>
        </View>

        {/* Açıklama */}
        <View style={{ paddingHorizontal: 20, marginTop: 16 }}>
          <Text style={styles.descText}>
            {club?.description ?? 'Elazığ\'da aktif bir topluluk.'}
          </Text>
        </View>

        {/* Yönetim */}
        {management.length > 0 && (
          <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View style={styles.sectionHeader}>
              <IcnCrown size={16} color={colors.amber} />
              <MonoLabel style={{ color: colors.amber }}>YÖNETİM</MonoLabel>
            </View>
            <View style={styles.mgmtCard}>
              {management.map((m, i) => {
                const tone = (m.avatar_tone as '1'|'2'|'3'|'4'|'5') ?? '1';
                const roleLabel = m.role === 'reis' ? 'Kulüp Reisi' : 'Yardımcı';
                const chipVariant = m.role === 'reis' ? 'ember' : 'amber';
                return (
                  <React.Fragment key={m.id}>
                    {i > 0 && <View style={styles.metaDivider} />}
                    <View style={styles.mgmtRow}>
                      <Avatar name={m.name} tone={tone} size={44} />
                      <View style={{ flex: 1 }}>
                        <NameWithBadges name={m.name} badges={[m.role] as any} size={14} />
                        <Text style={styles.mgmtRole}>{roleLabel}</Text>
                      </View>
                      <Chip variant={chipVariant as any}>{m.role === 'reis' ? 'Reis' : 'Yardımcı'}</Chip>
                    </View>
                  </React.Fragment>
                );
              })}
            </View>
          </View>
        )}

        {/* Tab bar */}
        <View style={styles.tabBar}>
          {(['etkinlikler', 'duvar', 'uyeler'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
              onPress={() => handleTabChange(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'etkinlikler' ? 'Etkinlikler' : tab === 'duvar' ? 'Duvar' : 'Üyeler'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab içerikleri */}
        <View style={{ paddingHorizontal: 20 }}>
          {activeTab === 'etkinlikler' && (
            <View style={{ gap: 10, marginTop: 16 }}>
              <View style={styles.sectionHeader}>
                <IcnBolt size={14} color={colors.ember} />
                <MonoLabel>ETKİNLİKLER</MonoLabel>
              </View>
              {clubEvents.length === 0 ? (
                <Text style={[styles.eventMetaText, { textAlign: 'center', marginTop: 20 }]}>
                  Bu cemiyetin henüz etkinliği yok.
                </Text>
              ) : clubEvents.map((ev, i) => (
                <TouchableOpacity
                  key={ev.id}
                  style={styles.eventCard}
                  activeOpacity={0.85}
                  onPress={() => (navigation as any).navigate('EventDetail', { eventId: ev.id })}
                >
                  <PhotoSlot tone={String((i % 5) + 1) as any} height={70} width={70} style={{ borderRadius: r.md }} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.eventTitle}>{ev.title}</Text>
                    <View style={styles.eventMeta}>
                      <IcnCalendar size={12} color={colors.stone} />
                      <Text style={styles.eventMetaText}>{ev.date} · {ev.time}</Text>
                    </View>
                    <View style={styles.eventMeta}>
                      <IcnUsers size={12} color={colors.stone} />
                      <Text style={styles.eventMetaText}>{ev.count} katılıyor</Text>
                    </View>
                  </View>
                  <View style={styles.joinSmallBtn}>
                    <Text style={styles.joinSmallText}>Katıl</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === 'uyeler' && (
            <View style={{ marginTop: 16 }}>
              <View style={[styles.sectionHeader, { marginBottom: 12 }]}>
                <IcnUsers size={14} color={colors.stone} />
                <MonoLabel>{club?.memberCount ?? members.length} ÜYE</MonoLabel>
              </View>
              {members.map((m) => {
                const tone = (m.avatar_tone as '1'|'2'|'3'|'4'|'5') ?? '1';
                return (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.memberRow}
                    activeOpacity={0.85}
                    onPress={() => (navigation as any).navigate('OtherProfile', { userId: m.id })}
                  >
                    <Avatar name={m.name} tone={tone} size={44} />
                    <View style={{ flex: 1 }}>
                      <NameWithBadges
                        name={m.name}
                        badges={m.role !== 'aza' ? [m.role] : []}
                        size={15}
                      />
                      <Text style={styles.memberJoined}>@{m.username}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {activeTab === 'duvar' && (
            <View style={{ marginTop: 16 }}>
              <Text style={styles.descText}>Duvar gönderileri yükleniyor...</Text>
            </View>
          )}
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
  identityRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16,
  },
  clubAvatarWrap: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: colors.bg,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 4,
  },
  clubMeta: {
    flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4,
  },
  clubMetaText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone,
  },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.stone3 },
  followBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.ember, paddingHorizontal: 16, paddingVertical: 9, borderRadius: r.pill,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  followingBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ruleSoft },
  followText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
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
  descText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.ink, lineHeight: fontSizes.lg * 1.65,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10,
  },
  mgmtCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 4,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  mgmtRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16,
  },
  mgmtRole: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 2,
  },
  metaDivider: { height: 1, backgroundColor: colors.ruleSoft, marginHorizontal: 16 },
  tabBar: {
    flexDirection: 'row', borderTopWidth: 1, borderBottomWidth: 1,
    borderColor: colors.ruleSoft, marginTop: 20,
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
  eventCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: r.md, padding: 12,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  eventTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: colors.ink,
  },
  eventMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  eventMetaText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone,
  },
  joinSmallBtn: {
    backgroundColor: colors.ink, paddingHorizontal: 12, paddingVertical: 7, borderRadius: r.pill,
  },
  joinSmallText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
  memberRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
  },
  memberJoined: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 2,
  },
});
