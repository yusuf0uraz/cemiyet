import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnClose, IcnArrow, IcnCamera, IcnUsers, IcnUnlock, IcnLock, IcnGlobe,
} from '../../components/ui/Icons';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { MonoLabel } from '../../components/ui/Chip';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { CategoryKey } from '../../tokens';
import type { ClubStackParamList } from '../../types';
import { useClubsStore } from '../../store/clubsStore';
import { imageFor } from '../../data/mockImages';
import { pickImageOrCamera } from '../../hooks/useImagePicker';

type Props = NativeStackScreenProps<ClubStackParamList, 'ClubCreate'>;

const ALL_CATS = Object.keys(categories) as CategoryKey[];

const MEMBERSHIP_OPTIONS = [
  { key: 'acik', label: 'Açık', desc: 'Herkes doğrudan katılabilir', icon: IcnUnlock },
  { key: 'onay', label: 'Onaylı', desc: 'Katılım için onay gerekir', icon: IcnUsers },
  { key: 'kapali', label: 'Kapalı', desc: 'Sadece davet ile', icon: IcnLock },
];

export function ClubCreateScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState<CategoryKey | null>(null);
  const [clubName, setClubName] = useState('');
  const [description, setDescription] = useState('');
  const [membershipModel, setMembershipModel] = useState('onay');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const totalSteps = 3;
  const createClub = useClubsStore(s => s.createClub);
  const loading = useClubsStore(s => s.loading);

  const canNextStep2 = clubName.trim().length >= 3;

  const handleCreate = async () => {
    if (!selectedCat || loading) return;
    await createClub({
      name: clubName.trim() || 'Yeni Cemiyet',
      cat: selectedCat,
      description: description.trim() || "Elazığ'da yeni kurulan cemiyet.",
      photo: coverPhoto ?? undefined,
    });
    navigation.navigate('Clubs');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <IcnClose size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cemiyet Kur</Text>
        <MonoLabel>{step} / {totalSteps}</MonoLabel>
      </View>

      {/* Progress */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>
              Cemiyetin ne{'\n'}<Text style={{ color: colors.ember }}>üstüne?</Text>
            </Text>
            <Text style={styles.stepSub}>Bir kategori seç. Cemiyetini en iyi tanımlayan.</Text>
            <View style={styles.catGrid}>
              {ALL_CATS.map((key) => {
                const def = categories[key];
                const isSelected = selectedCat === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.catCell,
                      isSelected && { backgroundColor: def.color, borderColor: def.color },
                    ]}
                    onPress={() => setSelectedCat(key)}
                    activeOpacity={0.85}
                  >
                    <CategoryIcon name={key} size={26} filled={isSelected} />
                    <Text style={[styles.catLabel, isSelected && { color: '#fff' }]}>{def.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <Animated.View entering={FadeInDown.delay(60)}>
            <Text style={styles.stepTitle}>
              Cemiyetini{'\n'}<Text style={{ color: colors.ember }}>tanımla.</Text>
            </Text>

            {/* Kapak fotoğrafı */}
            <TouchableOpacity
              style={styles.coverPhoto}
              activeOpacity={0.85}
              onPress={async () => {
                const uri = await pickImageOrCamera();
                if (uri) setCoverPhoto(uri);
              }}
            >
              {coverPhoto ? (
                <Image source={{ uri: coverPhoto }} style={{ width: '100%', height: 100, borderRadius: r.lg }} resizeMode="cover" />
              ) : (
                <>
                  <IcnCamera size={24} color={colors.stone} />
                  <Text style={styles.coverPhotoText}>Kapak fotoğrafı ekle</Text>
                  <Text style={styles.coverPhotoSub}>1440 × 480 önerilir</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Ad */}
            <View style={styles.fieldCard}>
              <MonoLabel style={{ fontSize: 9, paddingHorizontal: 16, paddingTop: 14 }}>CEMİYET ADI</MonoLabel>
              <TextInput
                style={styles.fieldInput}
                value={clubName}
                onChangeText={setClubName}
                placeholder="Cemiyetinin adı"
                placeholderTextColor={colors.stone2}
                autoCapitalize="words"
              />
            </View>

            {/* Açıklama */}
            <View style={[styles.fieldCard, { marginTop: 12 }]}>
              <View style={styles.fieldHeader}>
                <MonoLabel style={{ fontSize: 9 }}>AÇIKLAMA</MonoLabel>
                <Text style={[styles.charCount, description.length > 260 && { color: colors.ember }]}>
                  {description.length} / 280
                </Text>
              </View>
              <TextInput
                style={[styles.fieldInput, { minHeight: 80, textAlignVertical: 'top', paddingTop: 8 }]}
                value={description}
                onChangeText={v => v.length <= 280 && setDescription(v)}
                placeholder="Cemiyetini kısaca anlat..."
                placeholderTextColor={colors.stone2}
                multiline
              />
            </View>

            {/* Şehir */}
            <View style={[styles.fieldCard, { marginTop: 12 }]}>
              <View style={styles.metaRow}>
                <IcnGlobe size={18} color={colors.ember} />
                <View style={{ flex: 1 }}>
                  <MonoLabel style={{ fontSize: 9 }}>ŞEHİR</MonoLabel>
                  <Text style={styles.fieldValue}>Elazığ, Türkiye</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {step === 3 && (
          <View>
            <Text style={styles.stepTitle}>
              Üyelik{'\n'}<Text style={{ color: colors.ember }}>nasıl olsun?</Text>
            </Text>
            <Text style={styles.stepSub}>Cemiyetine katılım modelini belirle.</Text>

            <View style={{ gap: 10 }}>
              {MEMBERSHIP_OPTIONS.map(({ key, label, desc, icon: Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.membershipCard,
                    membershipModel === key && styles.membershipSelected,
                  ]}
                  onPress={() => setMembershipModel(key)}
                  activeOpacity={0.85}
                >
                  <View style={[
                    styles.membershipIcon,
                    membershipModel === key && { backgroundColor: colors.ember },
                  ]}>
                    <Icon size={20} color={membershipModel === key ? '#fff' : colors.stone} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.membershipLabel,
                      membershipModel === key && { color: colors.ember },
                    ]}>{label}</Text>
                    <Text style={styles.membershipDesc}>{desc}</Text>
                  </View>
                  {membershipModel === key && (
                    <View style={styles.selectedDot} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Maksimum üye */}
            <View style={[styles.fieldCard, { marginTop: 16 }]}>
              <View style={styles.metaRow}>
                <IcnUsers size={18} color={colors.ember} />
                <View style={{ flex: 1 }}>
                  <MonoLabel style={{ fontSize: 9 }}>MAKSİMUM ÜYE</MonoLabel>
                  <Text style={styles.fieldValue}>Sınırsız</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Alt butonlar */}
      <View style={styles.bottomActions}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
            <Text style={styles.backBtnText}>Geri</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.nextBtn, (
            (step === 1 && !selectedCat) ||
            (step === 2 && !canNextStep2)
          ) && styles.nextBtnDisabled]}
          onPress={() => {
            if (step < totalSteps) setStep(s => s + 1);
            else handleCreate();
          }}
          disabled={(step === 1 && !selectedCat) || (step === 2 && !canNextStep2)}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>{step === totalSteps ? 'Cemiyeti Kur' : 'Devam'}</Text>
          <IcnArrow size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  closeBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  progressBar: {
    height: 3, backgroundColor: colors.stone3, marginHorizontal: 20, borderRadius: 2,
  },
  progressFill: { height: '100%', backgroundColor: colors.ember, borderRadius: 2 },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 120 },
  stepTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.display,
    color: colors.ink, lineHeight: fontSizes.display * 1.02, letterSpacing: -0.8, marginBottom: 8,
  },
  stepSub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.stone, marginBottom: 24,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCell: {
    width: '22%', alignItems: 'center', backgroundColor: colors.surface,
    borderRadius: r.md, paddingVertical: 12, paddingHorizontal: 6,
    borderWidth: 1, borderColor: colors.ruleSoft,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  catLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.sm, color: colors.ink, marginTop: 6,
  },
  coverPhoto: {
    height: 100, backgroundColor: colors.surface, borderRadius: r.lg,
    alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1, borderColor: colors.ruleSoft, borderStyle: 'dashed', marginBottom: 12,
  },
  coverPhotoText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.stone,
  },
  coverPhotoSub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.sm, color: colors.stone2,
  },
  fieldCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 4,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  fieldHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    padding: 14, paddingHorizontal: 16, paddingBottom: 0,
  },
  charCount: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.sm, color: colors.stone2,
  },
  fieldValue: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.xl, color: colors.ink,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  fieldInput: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.xl, color: colors.ink,
    paddingHorizontal: 16, paddingVertical: 10, padding: 0,
  },
  fieldValueLong: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.ink,
    lineHeight: fontSizes.lg * 1.55, padding: 16, paddingTop: 8,
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14, paddingHorizontal: 16,
  },
  membershipCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 16,
    borderWidth: 1, borderColor: colors.ruleSoft,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  membershipSelected: { borderColor: colors.ember, backgroundColor: '#FFF5F3' },
  membershipIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.stone3, alignItems: 'center', justifyContent: 'center',
  },
  membershipLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  membershipDesc: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 2,
  },
  selectedDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ember },
  bottomActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 36,
    backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.ruleSoft,
  },
  backBtn: {
    paddingHorizontal: 20, paddingVertical: 16, borderRadius: r.pill,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ruleSoft,
  },
  backBtnText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'], color: colors.ink },
  nextBtn: {
    flex: 1, backgroundColor: colors.ember, borderRadius: r.pill, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'] },
});
