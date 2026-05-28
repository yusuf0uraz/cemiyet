import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnSearch, IcnFilter, IcnClose, IcnCalendar, IcnUsers, IcnPin,
} from '../../components/ui/Icons';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { NameWithBadges } from '../../components/ui/NameWithBadges';
import { MonoLabel } from '../../components/ui/Chip';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { CategoryKey } from '../../tokens';
import type { DiscoverStackParamList } from '../../types';
import { useEventsStore } from '../../store/eventsStore';
import { useClubsStore } from '../../store/clubsStore';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'Search'>;

type SearchTab = 'hepsi' | 'etkinlikler' | 'cemiyetler';

const RECENT_SEARCHES = ['Tenis Turnuvası', 'Hazar Gölü', 'Kitap Cemiyeti', 'Elazığ Fotoğraf'];
const TRENDING_CATS: CategoryKey[] = ['tenis', 'yuruyus', 'kitap', 'foto'];

const FILTER_OPTIONS = {
  zaman: ['Bugün', 'Bu hafta', 'Bu ay'],
  yer: ['Yakınımda', '1km', '5km', '10km'],
  katilim: ['Açık', 'Onaylı', 'Ücretsiz'],
};

export function SearchScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<SearchTab>('hepsi');
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const events = useEventsStore(s => s.events);
  const clubs = useClubsStore(s => s.clubs);

  const q = query.toLowerCase().trim();

  const matchedEvents = useMemo(() =>
    q ? events.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.club.toLowerCase().includes(q) ||
      e.place.toLowerCase().includes(q) ||
      e.cat.toLowerCase().includes(q)
    ) : [],
  [q, events]);

  const matchedClubs = useMemo(() =>
    q ? clubs.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.cat.toLowerCase().includes(q) ||
      (c.description ?? '').toLowerCase().includes(q)
    ) : [],
  [q, clubs]);

  const toggleFilter = (group: string, val: string) => {
    setActiveFilters(prev => ({
      ...prev,
      [group]: prev[group] === val ? '' : val,
    }));
  };

  const totalCount = activeTab === 'etkinlikler' ? matchedEvents.length
    : activeTab === 'cemiyetler' ? matchedClubs.length
    : matchedEvents.length + matchedClubs.length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Arama çubuğu */}
      <View style={styles.searchBar}>
        <IcnSearch size={18} color={colors.stone} />
        <TextInput
          style={styles.searchQuery}
          value={query}
          onChangeText={setQuery}
          placeholder="Etkinlik, cemiyet ara..."
          placeholderTextColor={colors.stone2}
          autoFocus
          returnKeyType="search"
        />
        {query ? (
          <TouchableOpacity onPress={() => setQuery('')}>
            <IcnClose size={18} color={colors.stone} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.searchDivider} />
        <TouchableOpacity onPress={() => setShowFilters(v => !v)}>
          <IcnFilter size={18} color={showFilters ? colors.ember : colors.stone} />
        </TouchableOpacity>
      </View>

      {/* Filtre paneli */}
      {showFilters && (
        <View style={styles.filterPanel}>
          {Object.entries(FILTER_OPTIONS).map(([group, opts]) => (
            <View key={group} style={styles.filterGroup}>
              <MonoLabel style={{ fontSize: 9, marginBottom: 6, textTransform: 'uppercase' }}>
                {group === 'zaman' ? 'ZAMAN' : group === 'yer' ? 'MESAFE' : 'KATEGORİ'}
              </MonoLabel>
              <View style={styles.filterOpts}>
                {opts.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      styles.filterOpt,
                      activeFilters[group] === opt && styles.filterOptActive,
                    ]}
                    onPress={() => toggleFilter(group, opt)}
                  >
                    <Text style={[
                      styles.filterOptText,
                      activeFilters[group] === opt && { color: '#fff' },
                    ]}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(['hepsi', 'etkinlikler', 'cemiyetler'] as SearchTab[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'hepsi' ? 'Hepsi'
                : tab === 'etkinlikler' ? 'Etkinlik'
                : 'Cemiyet'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingBottom: 60 }}>
        {!q ? (
          <View>
            {/* Son aramalar */}
            <MonoLabel style={{ marginBottom: 10 }}>SON ARAMALAR</MonoLabel>
            {RECENT_SEARCHES.map((term, i) => (
              <TouchableOpacity
                key={i}
                style={styles.recentRow}
                onPress={() => setQuery(term)}
                activeOpacity={0.7}
              >
                <IcnSearch size={16} color={colors.stone} />
                <Text style={styles.recentText}>{term}</Text>
                <IcnClose size={14} color={colors.stone2} />
              </TouchableOpacity>
            ))}

            {/* Trend kategoriler */}
            <MonoLabel style={{ marginTop: 20, marginBottom: 10 }}>TREND KATEGORİLER</MonoLabel>
            <View style={styles.trendGrid}>
              {TRENDING_CATS.map((key) => {
                const def = categories[key];
                return (
                  <TouchableOpacity
                    key={key}
                    style={[styles.trendCell, { backgroundColor: def.color + '20', borderColor: def.color + '40' }]}
                    onPress={() => setQuery(def.label)}
                    activeOpacity={0.85}
                  >
                    <CategoryIcon name={key} size={24} filled />
                    <Text style={[styles.trendLabel, { color: def.color }]}>{def.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={styles.resultCount}>{totalCount} sonuç</Text>

            {/* Etkinlik sonuçları */}
            {(activeTab === 'hepsi' || activeTab === 'etkinlikler') && matchedEvents.map((ev, index) => (
              <Animated.View key={ev.id} entering={FadeInDown.delay(index * 50)}>
                <TouchableOpacity
                  style={styles.resultCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('EventDetail', { eventId: ev.id })}
                >
                  <View style={styles.resultIcon}>
                    <CategoryIcon name={ev.cat} size={28} filled />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.resultTitle}>{ev.title}</Text>
                    <View style={styles.resultMeta}>
                      <IcnCalendar size={12} color={colors.stone} />
                      <Text style={styles.resultMetaText}>{ev.date} · {ev.time} · {ev.count} katılıyor</Text>
                    </View>
                  </View>
                  <View style={styles.typePill}>
                    <Text style={styles.typePillText}>ETK.</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {/* Cemiyet sonuçları */}
            {(activeTab === 'hepsi' || activeTab === 'cemiyetler') && matchedClubs.map((club, index) => (
              <Animated.View key={club.id} entering={FadeInDown.delay((matchedEvents.length + index) * 50)}>
                <TouchableOpacity
                  style={styles.resultCard}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate('ClubProfile', { clubId: club.id })}
                >
                  <View style={styles.resultIcon}>
                    <CategoryIcon name={club.cat} size={28} filled />
                  </View>
                  <View style={{ flex: 1 }}>
                    <NameWithBadges name={club.name} badges={['verified']} size={15} />
                    <View style={styles.resultMeta}>
                      <IcnUsers size={12} color={colors.stone} />
                      <Text style={styles.resultMetaText}>{club.memberCount} üye · Elazığ</Text>
                    </View>
                  </View>
                  <View style={styles.typePill}>
                    <Text style={styles.typePillText}>CEM.</Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))}

            {totalCount === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>"{query}" için sonuç bulunamadı</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginTop: 10, marginBottom: 8,
    backgroundColor: colors.surface, paddingVertical: 13, paddingHorizontal: 16,
    borderRadius: r.pill,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  searchQuery: {
    flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.ink,
  },
  searchDivider: { width: 1, height: 16, backgroundColor: colors.ruleSoft },
  filterPanel: {
    marginHorizontal: 16, marginBottom: 8, backgroundColor: colors.surface,
    borderRadius: r.lg, padding: 14, gap: 14,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  filterGroup: {},
  filterOpts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  filterOpt: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: r.pill,
    backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.ruleSoft,
  },
  filterOptActive: { backgroundColor: colors.ember, borderColor: colors.ember },
  filterOptText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.md, color: colors.ink,
  },
  tabBar: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
    backgroundColor: colors.surface,
  },
  tabItem: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabItemActive: { borderBottomColor: colors.ember },
  tabText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.md, color: colors.stone,
  },
  tabTextActive: { color: colors.ember, fontFamily: 'Manrope_700Bold' },
  recentRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
  },
  recentText: {
    flex: 1, fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.ink,
  },
  trendGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trendCell: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 10, paddingHorizontal: 14, borderRadius: r.pill, borderWidth: 1,
  },
  trendLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg,
  },
  resultCount: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.sm, color: colors.stone,
    letterSpacing: 0.3, marginBottom: 4,
  },
  resultCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.surface, borderRadius: r.md, padding: 12, paddingHorizontal: 14,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  resultIcon: {
    width: 48, height: 48, borderRadius: r.sm,
    backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.ruleSoft,
  },
  resultTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: colors.ink,
  },
  resultMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  resultMetaText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone,
  },
  typePill: {
    backgroundColor: colors.stone3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: r.pill,
  },
  typePillText: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.xs, color: colors.stone, letterSpacing: 0.3,
  },
  emptyState: {
    paddingVertical: 40, alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone,
  },
});
