import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnSearch, IcnPlus, IcnUsers, IcnCalendar, IcnChevronRight,
  IcnCrown,
} from '../../components/ui/Icons';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { MonoLabel } from '../../components/ui/Chip';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { CategoryKey } from '../../tokens';
import type { ClubStackParamList } from '../../types';
import { useClubsStore } from '../../store/clubsStore';

type Props = NativeStackScreenProps<ClubStackParamList, 'Clubs'>;


export function ClubsScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<'benim' | 'kesfet'>('benim');
  const clubs = useClubsStore(s => s.clubs);
  const fetchClubs = useClubsStore(s => s.fetchClubs);
  const joinClub = useClubsStore(s => s.joinClub);
  const myClubs = clubs.filter(c => c.myRole !== null);
  const suggested = clubs.filter(c => c.myRole === null);

  useEffect(() => { fetchClubs(); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Cemiyetler</Text>
          <Text style={styles.subtitle}>Topluluğun, burada</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => (navigation as any).getParent()?.getParent()?.navigate('DiscoverTab', { screen: 'Search' })}
          >
            <IcnSearch size={20} color={colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => navigation.navigate('ClubCreate')}
            activeOpacity={0.85}
          >
            <IcnPlus size={16} color="#fff" />
            <Text style={styles.createBtnText}>Kur</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'benim' && styles.tabItemActive]}
          onPress={() => setActiveTab('benim')}
        >
          <Text style={[styles.tabText, activeTab === 'benim' && styles.tabTextActive]}>
            Cemiyetlerim ({myClubs.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'kesfet' && styles.tabItemActive]}
          onPress={() => setActiveTab('kesfet')}
        >
          <Text style={[styles.tabText, activeTab === 'kesfet' && styles.tabTextActive]}>
            Yakında Keşfet
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {activeTab === 'benim' && (
          <View style={{ gap: 10 }}>
            {myClubs.map((club, index) => {
              const def = categories[club.cat];
              return (
                <Animated.View key={club.id} entering={FadeInDown.delay(index * 60).springify()}>
                <TouchableOpacity
                  style={styles.clubCard}
                  onPress={() => navigation.navigate('ClubProfile', { clubId: club.id })}
                  activeOpacity={0.88}
                >
                  {/* Accent bar */}
                  <View style={[styles.accentBar, { backgroundColor: def.color }]} />
                  <View style={styles.clubCardContent}>
                    <View style={styles.clubIconWrap}>
                      <CategoryIcon name={club.cat} size={32} filled />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text style={styles.clubName} numberOfLines={1}>{club.name}</Text>
                        {club.myRole === 'reis' && (
                          <View style={styles.roleBadge}>
                            <IcnCrown size={10} color={colors.amber} />
                            <Text style={styles.roleBadgeText}>Reis</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.clubMeta}>
                        <IcnUsers size={12} color={colors.stone} />
                        <Text style={styles.clubMetaText}>{club.memberCount} üye</Text>
                        {club.nextEvent && (
                          <>
                            <View style={styles.dot} />
                            <IcnCalendar size={12} color={colors.ember} />
                            <Text style={[styles.clubMetaText, { color: colors.ember }]}>{club.nextEvent}</Text>
                          </>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 8 }}>
                      {(club.unread ?? 0) > 0 && (
                        <View style={styles.unreadBadge}>
                          <Text style={styles.unreadText}>{club.unread}</Text>
                        </View>
                      )}
                      <IcnChevronRight size={18} color={colors.stone} />
                    </View>
                  </View>
                </TouchableOpacity>
                </Animated.View>
              );
            })}

            {/* Duvar kısayolu - en aktif cemiyet */}
            {myClubs.length > 0 && (
              <View style={styles.wallPreview}>
                <LinearGradient
                  colors={[colors.ink, colors.ink2]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: r.lg }]}
                />
                <View style={{ flex: 1 }}>
                  <MonoLabel style={{ color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                    {myClubs[0].name.toUpperCase()} · DUVAR
                  </MonoLabel>
                  <Text style={styles.wallPreviewText}>
                    Cemiyetindeki son gelişmeleri takip et, yorum yap.
                  </Text>
                  <Text style={styles.wallPreviewTime}>{myClubs[0].memberCount} üye · Aktif</Text>
                </View>
                <TouchableOpacity
                  style={styles.wallBtn}
                  onPress={() => navigation.navigate('ClubWall', { clubId: myClubs[0].id })}
                >
                  <Text style={styles.wallBtnText}>Duvara git</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {activeTab === 'kesfet' && (
          <View style={{ gap: 10 }}>
            <MonoLabel style={{ marginBottom: 4 }}>ELAZİĞ'DA YAKINDA</MonoLabel>
            {suggested.map((club) => {
              const def = categories[club.cat];
              return (
                <TouchableOpacity
                  key={club.id}
                  style={styles.suggestCard}
                  onPress={() => navigation.navigate('ClubProfile', { clubId: club.id })}
                  activeOpacity={0.88}
                >
                  <PhotoSlot uri={club.photo} height={80} width={80} style={{ borderRadius: r.md, flexShrink: 0 }}>
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                      <CategoryIcon name={club.cat} size={28} filled />
                    </View>
                  </PhotoSlot>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.suggestName}>{club.name}</Text>
                    <View style={styles.clubMeta}>
                      <IcnUsers size={12} color={colors.stone} />
                      <Text style={styles.clubMetaText}>{club.memberCount} üye</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.followBtn}
                      onPress={() => joinClub(club.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.followBtnText}>+ Katıl</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Kategori başına keşfet */}
            <MonoLabel style={{ marginTop: 16, marginBottom: 8 }}>KATEGORİYE GÖRE</MonoLabel>
            <View style={styles.catGrid}>
              {(['tenis', 'kitap', 'muzik', 'foto', 'yemek', 'oyun'] as CategoryKey[]).map((key) => {
                const def = categories[key];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.catCell, { backgroundColor: def.color + '18', borderColor: def.color + '40' }]}
                    onPress={() => (navigation as any).navigate('Search', { category: key })}
                    activeOpacity={0.85}
                  >
                    <CategoryIcon name={key} size={22} filled />
                    <Text style={[styles.catLabel, { color: def.color }]}>{def.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.display,
    color: colors.ink, letterSpacing: -0.8,
  },
  subtitle: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone, marginTop: 1,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  createBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.ember, paddingHorizontal: 14, paddingVertical: 9, borderRadius: r.pill,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  createBtnText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
    backgroundColor: colors.surface,
  },
  tabItem: {
    flex: 1, paddingVertical: 13, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: colors.ember },
  tabText: { fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.stone },
  tabTextActive: { color: colors.ember, fontFamily: 'Manrope_700Bold' },
  clubCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  accentBar: { width: 4 },
  clubCardContent: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14,
  },
  clubIconWrap: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.ruleSoft,
  },
  clubName: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  roleBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: colors.amber + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: r.pill,
  },
  roleBadgeText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xs, color: colors.amber,
  },
  clubMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  clubMetaText: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.stone3 },
  unreadBadge: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: colors.ember, alignItems: 'center', justifyContent: 'center',
  },
  unreadText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xs, color: '#fff' },
  wallPreview: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: r.lg, padding: 16, overflow: 'hidden', marginTop: 4,
  },
  wallPreviewText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: 'rgba(255,255,255,0.9)',
    lineHeight: fontSizes.lg * 1.5,
  },
  wallPreviewTime: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.sm, color: 'rgba(255,255,255,0.4)', marginTop: 4,
  },
  wallBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: r.pill,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  wallBtnText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
  suggestCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 14,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  suggestName: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  followBtn: {
    marginTop: 8, alignSelf: 'flex-start',
    backgroundColor: colors.ink, paddingHorizontal: 12, paddingVertical: 6, borderRadius: r.pill,
  },
  followBtnText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catCell: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 9, paddingHorizontal: 14, borderRadius: r.pill, borderWidth: 1,
  },
  catLabel: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md },
});
