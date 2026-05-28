import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { CemiAppLogo } from '../../components/ui/CemiAppLogo';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import { IcnSearch, IcnFilter } from '../../components/ui/Icons';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { CategoryKey } from '../../tokens';
import type { DiscoverStackParamList } from '../../types';
import { useClubsStore } from '../../store/clubsStore';
import { useEventsStore } from '../../store/eventsStore';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'Discover'>;

const CAT_LIST: CategoryKey[] = ['tenis', 'yuruyus', 'kitap', 'muzik', 'atolye', 'yemek', 'oyun', 'foto'];

export function DiscoverScreen({ navigation }: Props) {
  const clubs = useClubsStore(s => s.clubs);
  const fetchClubs = useClubsStore(s => s.fetchClubs);
  const events = useEventsStore(s => s.events);
  const fetchEvents = useEventsStore(s => s.fetchEvents);
  const nearbyClubs = clubs.slice(0, 3);

  useEffect(() => {
    fetchClubs();
    fetchEvents();
  }, []);

  const catEventCount = (key: CategoryKey) => events.filter(e => e.cat === key).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Başlık */}
        <View style={{ marginBottom: 18 }}>
          <Text style={styles.title}>
            Ne yapmak{'\n'}<Text style={{ color: colors.ember }}>istiyorsun?</Text>
          </Text>
        </View>

        {/* Arama */}
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('Search')}
        >
          <IcnSearch size={20} color={colors.stone} />
          <Text style={styles.searchPlaceholder}>Etkinlik, cemiyet, mekân ara</Text>
          <IcnFilter size={20} color={colors.stone} />
        </TouchableOpacity>

        {/* Kategori grid 4 sütun */}
        <View style={styles.catGrid}>
          {CAT_LIST.map((key) => {
            const def = categories[key];
            const count = catEventCount(key);
            return (
              <TouchableOpacity
                key={key}
                style={styles.catCell}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('Search')}
              >
                <CategoryIcon name={key} size={40} filled />
                <Text style={styles.catLabel}>{def.label}</Text>
                <Text style={styles.catCount}>{count > 0 ? `${count} ETK.` : '—'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bu hafta küratörlü */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={{ marginBottom: 24 }}
          onPress={() => navigation.navigate('EventDetail', { eventId: 'hazar-weekend-01' })}
        >
          <LinearGradient
            colors={[colors.ember, '#C03A1F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.featuredCard}
          >
            <Text style={styles.featuredLabel}>BU HAFTA · KÜRATÖRLÜ</Text>
            <Text style={styles.featuredTitle}>Hazar'da{'\n'}bir hafta sonu</Text>
            <Text style={styles.featuredSub}>Sivrice, Maden ve Çağlar köyünde 7 etkinlik.</Text>
            <View style={styles.featuredTags}>
              {(['tenis', 'yuruyus', 'foto'] as CategoryKey[]).map((k) => (
                <View key={k} style={styles.featuredTag}>
                  <CategoryIcon name={k} size={20} filled />
                  <Text style={styles.featuredTagText}>{categories[k].label}</Text>
                </View>
              ))}
            </View>
            <View style={[styles.featuredBg]}>
              <CemiAppLogo size={180} color="rgba(255,255,255,0.15)" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Yakındaki cemiyetler */}
        <View>
          <View style={styles.rowHeader}>
            <Text style={styles.rowTitle}>Yakındaki cemiyetler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Search')}>
              <Text style={styles.seeAll}>Tümü →</Text>
            </TouchableOpacity>
          </View>
          {nearbyClubs.map((club) => (
            <TouchableOpacity
              key={club.id}
              style={styles.clubCard}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('ClubProfile', { clubId: club.id })}
            >
              <CategoryIcon name={club.cat} size={44} filled />
              <View style={{ flex: 1, minWidth: 0 }}>
                <NameWithBadges name={club.name} badges={['verified']} size={14} />
                <Text style={styles.clubMeta}>{club.memberCount} üye</Text>
              </View>
              <TouchableOpacity
                style={styles.followBtn}
                onPress={() => navigation.navigate('ClubProfile', { clubId: club.id })}
              >
                <Text style={styles.followText}>{club.myRole ? 'Üye' : 'Takip'}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: fontSizes.display, color: colors.ink,
    lineHeight: fontSizes.display * 1.02, letterSpacing: -0.8,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, paddingVertical: 14, paddingHorizontal: 18,
    borderRadius: r.pill, marginBottom: 22,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  searchPlaceholder: {
    flex: 1, fontFamily: 'Manrope_500Medium', fontSize: fontSizes.xl, color: colors.stone,
  },
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 26,
  },
  catCell: {
    width: '22%', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: r.md,
    paddingVertical: 14, paddingHorizontal: 8,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  catLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.base, color: colors.ink, marginTop: 8,
  },
  catCount: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs,
    color: colors.stone, marginTop: 2, letterSpacing: 0.4,
  },
  featuredCard: {
    borderRadius: r.lg, padding: 22, paddingBottom: 22, overflow: 'hidden',
  },
  featuredLabel: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs,
    letterSpacing: 0.5, color: 'rgba(255,255,255,0.7)',
  },
  featuredTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: 28,
    color: '#fff', marginTop: 6, letterSpacing: -0.4, lineHeight: 28 * 1.1,
  },
  featuredSub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: 'rgba(255,255,255,0.85)', marginTop: 10, lineHeight: fontSizes.lg * 1.5,
    maxWidth: 240,
  },
  featuredTags: { flexDirection: 'row', gap: 8, marginTop: 14 },
  featuredTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 5, paddingHorizontal: 5,
    paddingRight: 12, borderRadius: r.pill,
  },
  featuredTagText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.base, color: '#fff' },
  featuredBg: {
    position: 'absolute', right: -30, top: -30,
  },
  rowHeader: {
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12,
  },
  rowTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['5xl'], letterSpacing: -0.3,
  },
  seeAll: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ember,
  },
  clubCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: r.md,
    padding: 12, paddingHorizontal: 14, marginBottom: 8,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  clubMeta: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 2,
  },
  followBtn: {
    backgroundColor: colors.ink, paddingHorizontal: 14, paddingVertical: 8, borderRadius: r.pill,
  },
  followText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md },
});
