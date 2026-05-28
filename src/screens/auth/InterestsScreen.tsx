import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IcnArrowLeft, IcnArrow, IcnSparkle, IcnCheck } from '../../components/ui/Icons';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { AuthStackParamList } from '../../types';
import type { CategoryKey } from '../../tokens';
import { useAuthStore } from '../../store/authStore';
import { useClubsStore } from '../../store/clubsStore';
import { apiClient } from '../../services/apiClient';
import { ENDPOINTS } from '../../config/api';

type Props = NativeStackScreenProps<AuthStackParamList, 'Interests'>;

const ALL_CATS = Object.keys(categories) as CategoryKey[];
const SCREEN_W = Dimensions.get('window').width;
const CELL_W = Math.floor((SCREEN_W - 40 - 20) / 3); // padding*2 + gap*2

const STATIC_SUGGESTIONS = [
  { nameHint: 'Tenis', fallbackName: 'F.Ü. Tenis Kulübü', members: '124 üye', cat: 'tenis' as CategoryKey },
  { nameHint: 'Yürüyüş', fallbackName: 'Hazar Sabah Yürüyüşçüleri', members: '38 üye', cat: 'yuruyus' as CategoryKey },
  { nameHint: 'Kitap', fallbackName: 'Mahalle Kitap Cemiyeti', members: '67 üye', cat: 'kitap' as CategoryKey },
];

export function InterestsScreen({ navigation, route }: Props) {
  const [selected, setSelected] = useState<Set<CategoryKey>>(new Set());
  const [followedClubs, setFollowedClubs] = useState<Set<string>>(new Set());
  const register = useAuthStore(s => s.register);
  const loading = useAuthStore(s => s.loading);
  const joinClub = useClubsStore(s => s.joinClub);
  const clubs = useClubsStore(s => s.clubs);

  const { name, username, bio } = route.params;
  const phone = (route.params as any).phone as string | undefined;
  const firebaseUid = (route.params as any).firebaseUid as string | undefined;

  const toggle = (key: CategoryKey) => {
    const next = new Set(selected);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setSelected(next);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.root}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <IcnArrowLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.skipText}>Atla</Text>
          </TouchableOpacity>
        </View>

        {/* Başlık */}
        <View style={styles.titleArea}>
          <Text style={styles.title}>
            Sana ne <Text style={{ color: colors.ember }}>gösterelim?</Text>
          </Text>
          <Text style={styles.sub}>
            En az 3 tane seç.{' '}
            <Text style={{ color: colors.ember, fontFamily: 'Manrope_700Bold' }}>
              {selected.size} seçili.
            </Text>
          </Text>
        </View>

        {/* Kategori grid */}
        <View style={styles.grid}>
          {ALL_CATS.map((key, index) => {
            const def = categories[key];
            const isSelected = selected.has(key);
            return (
              <Animated.View key={key} entering={FadeInDown.delay(index * 40)} style={{ width: CELL_W }}>
                <TouchableOpacity
                  onPress={() => toggle(key)}
                  style={[
                    styles.catCell,
                    isSelected && { backgroundColor: def.color, borderColor: def.color },
                    isSelected && { shadowColor: def.color, shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 6 },
                  ]}
                  activeOpacity={0.85}
                >
                  <View style={{ marginBottom: 6 }}>
                    <CategoryIcon name={key} size={28} filled={isSelected} />
                  </View>
                  <Text style={[styles.catLabel, isSelected && { color: '#fff' }]}>{def.label}</Text>
                  {isSelected && (
                    <View style={styles.catCheck}>
                      <IcnCheck size={12} color={def.color} strokeWidth={3} />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* Öneriler */}
        <View style={styles.suggCard}>
          <View style={styles.suggHeader}>
            <IcnSparkle size={18} color={colors.ember} />
            <Text style={styles.suggTitle}>ELAZIĞ'DA SANA UYGUN</Text>
          </View>
          {STATIC_SUGGESTIONS.map(({ nameHint, fallbackName, members, cat }, i) => {
            const matchedClub = clubs.find(c => c.name.includes(nameHint));
            const displayName = matchedClub?.name ?? fallbackName;
            const isFollowed = matchedClub ? followedClubs.has(matchedClub.id) : false;
            return (
              <View key={i} style={[styles.suggRow, i < STATIC_SUGGESTIONS.length - 1 && styles.suggBorder]}>
                <CategoryIcon name={cat} size={36} filled />
                <View style={{ flex: 1 }}>
                  <Text style={styles.suggName}>{displayName}</Text>
                  <Text style={styles.suggMembers}>{matchedClub ? `${matchedClub.memberCount} üye` : members}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.followBtn, isFollowed && { backgroundColor: colors.stone3 }]}
                  onPress={async () => {
                    if (!matchedClub) return;
                    if (!isFollowed) {
                      setFollowedClubs(s => new Set([...s, matchedClub.id]));
                      await joinClub(matchedClub.id);
                    }
                  }}
                >
                  <Text style={[styles.followText, isFollowed && { color: colors.stone }]}>
                    {isFollowed ? '✓ Takip' : '+ Takip'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Alt buton */}
      <View style={styles.bottomAction}>
        <TouchableOpacity
          style={[styles.btnEmber, selected.size < 3 && styles.btnDisabled]}
          onPress={async () => {
            if (selected.size < 3) return;
            if (phone) {
              await register({ phone, name, username, bio });
            }
            // İlgi alanlarını backend'e kaydet (arka planda)
            try {
              await apiClient.post(ENDPOINTS.users.interests, {
                categories: Array.from(selected),
              });
            } catch { /* sessizce geç */ }
          }}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>CemiApp'e gir</Text>
          <IcnArrow size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const CELL_COUNT = 3;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  root: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  skipText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.stone,
  },
  titleArea: { marginBottom: 22 },
  title: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.display,
    color: colors.ink, lineHeight: fontSizes.display * 1.02, letterSpacing: -0.8,
  },
  sub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.stone, marginTop: 10, lineHeight: fontSizes.lg * 1.55,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  catCell: {
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: r.md,
    borderWidth: 1,
    borderColor: colors.ruleSoft,
    position: 'relative',
  },
  catLabel: {
    fontFamily: 'Manrope_700Bold',
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  catCheck: {
    position: 'absolute', top: 6, right: 6,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  suggCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 16,
    marginBottom: 16,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  suggHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12,
  },
  suggTitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: fontSizes.xs, letterSpacing: 0.6,
    textTransform: 'uppercase', color: colors.stone,
  },
  suggRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8,
  },
  suggBorder: { borderBottomWidth: 1, borderBottomColor: colors.ruleSoft },
  suggName: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: colors.ink,
  },
  suggMembers: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.base, color: colors.stone, marginTop: 1,
  },
  followBtn: {
    backgroundColor: colors.ink, paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: r.pill,
  },
  followText: {
    color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md,
  },
  bottomAction: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 20, paddingBottom: 40,
    backgroundColor: 'transparent',
  },
  btnEmber: {
    backgroundColor: colors.ember, borderRadius: r.pill, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'] },
});
