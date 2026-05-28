import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnSearch, IcnFilter, IcnPin, IcnCalendar,
} from '../../components/ui/Icons';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { CategoryKey } from '../../tokens';
import type { MapStackParamList } from '../../types';
import { useEventsStore } from '../../store/eventsStore';
import { useClubsStore } from '../../store/clubsStore';

type Props = NativeStackScreenProps<MapStackParamList, 'Map'>;

const ELAZIG = {
  latitude: 38.6748,
  longitude: 39.2225,
  latitudeDelta: 0.06,
  longitudeDelta: 0.06,
};

type MapPin = {
  id: string;
  cat: CategoryKey;
  title: string;
  count: number;
  latitude: number;
  longitude: number;
  clubId: string;
  color: string;
};

// Elazığ'daki sabit konumlar — kategori bazlı club eşleşmesi runtime'da yapılır
const PIN_DEFS: Omit<MapPin, 'count' | 'clubId'>[] = [
  { id: 'tenis-01',   cat: 'tenis',   title: 'F.Ü. Tenis Kortları',        latitude: 38.6826, longitude: 39.2311, color: '#E84C2C' },
  { id: 'yuruyus-01', cat: 'yuruyus', title: 'Hazar Gölü Yürüyüş Parkuru', latitude: 38.4937, longitude: 39.4236, color: '#2E8B57' },
  { id: 'kitap-01',   cat: 'kitap',   title: 'Şehir Kütüphanesi',           latitude: 38.6745, longitude: 39.2231, color: '#D49B2E' },
  { id: 'muzik-01',   cat: 'muzik',   title: 'Merkez Kültür Evi',           latitude: 38.6756, longitude: 39.2185, color: '#7B4FA0' },
  { id: 'foto-01',    cat: 'foto',    title: 'Harput Kalesi',                latitude: 38.7086, longitude: 39.2531, color: '#2E7DD8' },
  { id: 'futbol-01',  cat: 'futbol',  title: 'E.Ü. Futbol Sahası',          latitude: 38.6801, longitude: 39.2398, color: '#1A7F3C' },
  { id: 'bisiklet-01',cat: 'bisiklet',title: 'Bisiklet Yolu',               latitude: 38.6690, longitude: 39.2100, color: '#E88C2C' },
  { id: 'kahve-01',   cat: 'kahve',   title: 'Çarşı Merkezi',               latitude: 38.6731, longitude: 39.2210, color: '#8B5E3C' },
];

const FILTER_CATS = PIN_DEFS.map(p => p.cat) as CategoryKey[];

export function MapScreen({ navigation }: Props) {
  const [activeFilter, setActiveFilter] = useState<CategoryKey | null>(null);
  const mapRef = useRef<MapView>(null);
  const allEvents = useEventsStore(s => s.events);
  const clubs = useClubsStore(s => s.clubs);

  // Kategori bazlı club eşleştirme — aynı kategorideki ilk club'ı kullan
  const MAP_PINS: MapPin[] = useMemo(() => PIN_DEFS.map(def => {
    const match = clubs.find(c => c.cat === def.cat);
    return { ...def, clubId: match?.id ?? '', count: 0 };
  }), [clubs]);

  const [selectedPin, setSelectedPin] = useState<MapPin | null>(null);

  useEffect(() => {
    if (MAP_PINS.length > 0 && !selectedPin) {
      setSelectedPin(MAP_PINS[0]);
    }
  }, [MAP_PINS]);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }).catch(() => null);
        if (!loc) return;
        const region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        };
        mapRef.current?.animateToRegion(region, 600);
      } catch {
        // Konum alınamadı — Elazığ merkezi üzerinde kal
      }
    })();
  }, []);

  // Her pin için ilgili etkinlikleri hesapla
  const pinEvents = useMemo(() => {
    const map: Record<string, typeof allEvents> = {};
    for (const pin of MAP_PINS) {
      // Hem clubId eşleşmesi hem de kategori eşleşmesi
      map[pin.id] = allEvents.filter(e =>
        (pin.clubId && e.clubId === pin.clubId) || e.cat === pin.cat
      );
    }
    return map;
  }, [allEvents, MAP_PINS]);

  const visiblePins = useMemo(() => {
    const base = MAP_PINS.map(p => ({
      ...p,
      count: pinEvents[p.id]?.length ?? 0,
    }));
    return activeFilter ? base.filter(p => p.cat === activeFilter) : base;
  }, [activeFilter, pinEvents, MAP_PINS]);

  const goToPin = (pin: MapPin) => {
    setSelectedPin(pin);
    mapRef.current?.animateToRegion({
      latitude: pin.latitude,
      longitude: pin.longitude,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    }, 400);
  };

  const handlePinPress = () => {
    if (!selectedPin?.clubId) return;
    navigation.navigate('ClubProfile', { clubId: selectedPin.clubId });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={ELAZIG}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
      >
        {visiblePins.map((pin) => {
          const isSelected = selectedPin?.id === pin.id;
          return (
            <Marker
              key={pin.id}
              coordinate={{ latitude: pin.latitude, longitude: pin.longitude }}
              onPress={() => goToPin(pin)}
              tracksViewChanges={false}
            >
              <View style={[styles.markerWrap, isSelected && styles.markerWrapSelected]}>
                <View style={[styles.markerBubble, { backgroundColor: isSelected ? pin.color : colors.surface }]}>
                  <CategoryIcon name={pin.cat} size={isSelected ? 18 : 14} filled={isSelected} />
                  {pin.count > 0 && (
                    <Text style={[styles.markerCount, { color: isSelected ? '#fff' : colors.ink }]}>
                      {pin.count}
                    </Text>
                  )}
                </View>
                <View style={[styles.markerTail, { borderTopColor: isSelected ? pin.color : colors.surface }]} />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Üst arama + filtreler */}
      <SafeAreaView edges={['top']} style={styles.topOverlay} pointerEvents="box-none">
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.9}
          onPress={() => (navigation as any).getParent()?.navigate('DiscoverTab', { screen: 'Search' })}
        >
          <IcnSearch size={18} color={colors.stone} />
          <Text style={styles.searchText}>Haritada ara...</Text>
          <IcnFilter size={18} color={colors.stone} />
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingBottom: 4 }}
        >
          {FILTER_CATS.map((key) => {
            const def = categories[key];
            if (!def) return null;
            const isActive = activeFilter === key;
            return (
              <TouchableOpacity
                key={key}
                style={[styles.filterChip, isActive && { backgroundColor: def.color, borderColor: def.color }]}
                onPress={() => setActiveFilter(isActive ? null : key)}
                activeOpacity={0.85}
              >
                <CategoryIcon name={key} size={14} filled={isActive} />
                <Text style={[styles.filterChipText, isActive && { color: '#fff' }]}>{def.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Alt kart — seçili pin */}
      {selectedPin && (
        <View style={styles.bottomCard}>
          <View style={styles.bottomCardDragRow}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.locationInfo}>
            <View style={[styles.pinIconCircle, { backgroundColor: selectedPin.color + '20' }]}>
              <CategoryIcon name={selectedPin.cat} size={32} filled />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>{selectedPin.title}</Text>
              <View style={styles.locationMeta}>
                <IcnCalendar size={13} color={colors.stone} />
                <Text style={styles.locationMetaText}>
                  {pinEvents[selectedPin.id]?.length ?? 0} aktif etkinlik
                </Text>
                <View style={styles.dot} />
                <IcnPin size={13} color={colors.stone} />
                <Text style={styles.locationMetaText}>Elazığ</Text>
              </View>
            </View>
            {!!selectedPin.clubId && (
              <TouchableOpacity
                style={[styles.goBtn, { backgroundColor: selectedPin.color }]}
                onPress={handlePinPress}
              >
                <Text style={styles.goBtnText}>Gör</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Mini etkinlik kartları */}
          <View style={{ gap: 8, marginTop: 4 }}>
            {(pinEvents[selectedPin.id] ?? []).slice(0, 3).map((ev, i) => (
              <TouchableOpacity
                key={ev.id}
                style={styles.miniEventCard}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('EventDetail', { eventId: ev.id })}
              >
                <PhotoSlot tone={String((i % 5) + 1) as any} height={54} width={54} style={{ borderRadius: r.sm }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.miniEventTitle} numberOfLines={1}>{ev.title}</Text>
                  <Text style={styles.miniEventMeta}>{ev.date} · {ev.time} · {ev.count} katılıyor</Text>
                </View>
                <View style={[styles.joinMiniBtn, { backgroundColor: selectedPin.color }]}>
                  <Text style={styles.joinMiniText}>Katıl</Text>
                </View>
              </TouchableOpacity>
            ))}
            {(pinEvents[selectedPin.id] ?? []).length === 0 && (
              <Text style={[styles.miniEventMeta, { textAlign: 'center', paddingVertical: 12 }]}>
                Bu konumda aktif etkinlik yok.
              </Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  map: { ...StyleSheet.absoluteFill },
  topOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, gap: 8,
  },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.surface, paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: r.pill, marginHorizontal: 16, marginTop: 8,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
  },
  searchText: {
    flex: 1, fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.stone,
  },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: r.pill, borderWidth: 1, borderColor: colors.ruleSoft,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 3,
  },
  filterChipText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ink,
  },
  markerWrap: { alignItems: 'center' },
  markerWrapSelected: { transform: [{ scale: 1.15 }] },
  markerBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 7, borderRadius: r.pill,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 6, elevation: 5,
  },
  markerTail: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 7,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    borderTopColor: colors.surface,
  },
  markerCount: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.sm },
  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: r.xl, borderTopRightRadius: r.xl,
    padding: 20, paddingTop: 10,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.1, shadowRadius: 14, elevation: 14,
  },
  bottomCardDragRow: { alignItems: 'center', marginBottom: 14 },
  dragHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.stone3 },
  locationInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  pinIconCircle: {
    width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
  },
  locationTitle: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink },
  locationMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  locationMetaText: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.stone3 },
  goBtn: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: r.pill },
  goBtnText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
  miniEventCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: colors.bg, borderRadius: r.md, padding: 8,
  },
  miniEventTitle: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: colors.ink },
  miniEventMeta: { fontFamily: 'Manrope_500Medium', fontSize: fontSizes.sm, color: colors.stone, marginTop: 2 },
  joinMiniBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: r.pill },
  joinMiniText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
});
