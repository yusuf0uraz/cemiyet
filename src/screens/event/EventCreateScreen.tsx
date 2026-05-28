import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnClose, IcnArrow, IcnCalendar, IcnClock,
  IcnPin, IcnLock, IcnUnlock, IcnUsers, IcnCamera,
} from '../../components/ui/Icons';
import { CategoryIcon } from '../../components/ui/CategoryIcon';
import { MonoLabel } from '../../components/ui/Chip';
import { colors, r, fontSizes, categories } from '../../tokens';
import type { CategoryKey } from '../../tokens';
import type { HomeStackParamList } from '../../types';
import { useEventsStore } from '../../store/eventsStore';
import { useClubsStore } from '../../store/clubsStore';
import { pickImageOrCamera } from '../../hooks/useImagePicker';

type Props = NativeStackScreenProps<HomeStackParamList, 'EventCreate'>;

const QUICK_CATS: CategoryKey[] = ['tenis', 'yuruyus', 'kitap', 'muzik', 'foto', 'yemek', 'oyun', 'atolye'];

const VISIBILITY_OPTIONS = [
  { key: 'acik', label: 'Açık', desc: 'Herkes görebilir ve katılabilir', icon: IcnUnlock },
  { key: 'yariAcik', label: 'Yarı Açık', desc: 'Herkes görür, katılım onaylı', icon: IcnUsers },
  { key: 'kapali', label: 'Kapalı', desc: 'Sadece davet edilenler', icon: IcnLock },
];

export function EventCreateScreen({ navigation }: Props) {
  const [step, setStep] = useState(1);
  const [selectedCat, setSelectedCat] = useState<CategoryKey | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [place, setPlace] = useState('');
  const [visibility, setVisibility] = useState('acik');
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const createEvent = useEventsStore(s => s.createEvent);
  const loading = useEventsStore(s => s.loading);
  const clubs = useClubsStore(s => s.clubs);

  const myClub = clubs.find(c => c.myRole === 'reis' || c.myRole === 'yardimci')
    ?? clubs.find(c => c.myRole !== null)
    ?? clubs[0];

  const totalSteps = 4;

  const canNextStep2 = title.trim().length > 0;
  const canNextStep3 = date.trim().length > 0 && time.trim().length > 0 && place.trim().length > 0;

  const handlePublish = async () => {
    if (!selectedCat || loading) return;
    await createEvent({
      cat: selectedCat,
      title: title.trim() || 'Yeni Etkinlik',
      club_id: myClub?.id ?? '',
      club_name: myClub?.name ?? '',
      date: date.trim() || 'Bugün',
      time: time.trim() || '18:00',
      place: place.trim() || 'Elazığ',
      capacity: 20,
      free: visibility === 'acik',
      photo: coverPhoto ?? undefined,
    });
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <IcnClose size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Etkinlik Oluştur</Text>
        <MonoLabel>{step} / {totalSteps}</MonoLabel>
      </View>

      {/* İlerleme çubuğu */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>
              Etkinlik türünü{'\n'}<Text style={{ color: colors.ember }}>seç.</Text>
            </Text>
            <Text style={styles.stepSub}>Bu etkinlik hangi kategoride?</Text>

            {/* Kategori grid */}
            <View style={styles.catGrid}>
              {QUICK_CATS.map((key) => {
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
                    <CategoryIcon name={key} size={28} filled={isSelected} />
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
              Etkinliğini{'\n'}<Text style={{ color: colors.ember }}>tanımla.</Text>
            </Text>

            {/* Başlık */}
            <View style={styles.fieldCard}>
              <MonoLabel style={{ fontSize: 9, paddingHorizontal: 16, paddingTop: 14 }}>ETKİNLİK BAŞLIĞI</MonoLabel>
              <TextInput
                style={styles.fieldInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Etkinlik adı"
                placeholderTextColor={colors.stone2}
                autoCapitalize="sentences"
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
                placeholder="Etkinliği kısaca anlat..."
                placeholderTextColor={colors.stone2}
                multiline
              />
            </View>

            {/* Fotoğraf ekle */}
            <TouchableOpacity
              style={styles.photoAdd}
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
                  <IcnCamera size={22} color={colors.stone} />
                  <Text style={styles.photoAddText}>Kapak fotoğrafı ekle</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {step === 3 && (
          <Animated.View entering={FadeInDown.delay(60)}>
            <Text style={styles.stepTitle}>
              Ne zaman,{'\n'}<Text style={{ color: colors.ember }}>nerede?</Text>
            </Text>

            <View style={styles.fieldCard}>
              <View style={styles.metaRow}>
                <IcnCalendar size={18} color={colors.ember} />
                <View style={{ flex: 1 }}>
                  <MonoLabel style={{ fontSize: 9 }}>TARİH</MonoLabel>
                  <TextInput
                    style={styles.fieldInput}
                    value={date}
                    onChangeText={setDate}
                    placeholder="örn: 27 Mayıs 2026"
                    placeholderTextColor={colors.stone2}
                  />
                </View>
              </View>
              <View style={styles.fieldDivider} />
              <View style={styles.metaRow}>
                <IcnClock size={18} color={colors.ember} />
                <View style={{ flex: 1 }}>
                  <MonoLabel style={{ fontSize: 9 }}>SAAT</MonoLabel>
                  <TextInput
                    style={styles.fieldInput}
                    value={time}
                    onChangeText={setTime}
                    placeholder="örn: 18:30"
                    placeholderTextColor={colors.stone2}
                    keyboardType="numeric"
                  />
                </View>
              </View>
              <View style={styles.fieldDivider} />
              <View style={styles.metaRow}>
                <IcnPin size={18} color={colors.ember} />
                <View style={{ flex: 1 }}>
                  <MonoLabel style={{ fontSize: 9 }}>KONUM</MonoLabel>
                  <TextInput
                    style={styles.fieldInput}
                    value={place}
                    onChangeText={setPlace}
                    placeholder="örn: F.Ü. Tenis Kortları"
                    placeholderTextColor={colors.stone2}
                  />
                </View>
              </View>
            </View>

            {/* Kapasite */}
            <View style={[styles.fieldCard, { marginTop: 12 }]}>
              <View style={styles.metaRow}>
                <IcnUsers size={18} color={colors.ember} />
                <View style={{ flex: 1 }}>
                  <MonoLabel style={{ fontSize: 9 }}>KAPASİTE</MonoLabel>
                  <Text style={styles.fieldValue}>Sınırsız</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {step === 4 && (
          <View>
            <Text style={styles.stepTitle}>
              Kim{'\n'}<Text style={{ color: colors.ember }}>görebilsin?</Text>
            </Text>
            <Text style={styles.stepSub}>Etkinliğin görünürlüğünü belirle.</Text>

            <View style={{ gap: 10, marginTop: 8 }}>
              {VISIBILITY_OPTIONS.map(({ key, label, desc, icon: Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.visibilityCard,
                    visibility === key && styles.visibilitySelected,
                  ]}
                  onPress={() => setVisibility(key)}
                  activeOpacity={0.85}
                >
                  <View style={[
                    styles.visibilityIcon,
                    visibility === key && { backgroundColor: colors.ember },
                  ]}>
                    <Icon size={20} color={visibility === key ? '#fff' : colors.stone} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[
                      styles.visibilityLabel,
                      visibility === key && { color: colors.ember },
                    ]}>{label}</Text>
                    <Text style={styles.visibilityDesc}>{desc}</Text>
                  </View>
                  {visibility === key && (
                    <View style={styles.selectedDot} />
                  )}
                </TouchableOpacity>
              ))}
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
            (step === 2 && !canNextStep2) ||
            (step === 3 && !canNextStep3) ||
            loading
          ) && styles.nextBtnDisabled]}
          onPress={() => {
            if (step < totalSteps) setStep(s => s + 1);
            else handlePublish();
          }}
          disabled={
            (step === 1 && !selectedCat) ||
            (step === 2 && !canNextStep2) ||
            (step === 3 && !canNextStep3) ||
            loading
          }
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>{step === totalSteps ? (loading ? 'Yayınlanıyor...' : 'Yayınla') : 'Devam'}</Text>
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
  progressFill: {
    height: '100%', backgroundColor: colors.ember, borderRadius: 2,
  },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 120 },
  stepTitle: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.display,
    color: colors.ink, lineHeight: fontSizes.display * 1.02, letterSpacing: -0.8, marginBottom: 8,
  },
  stepSub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.stone, marginBottom: 24,
  },
  catGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 10,
  },
  catCell: {
    width: '22%', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: r.md,
    paddingVertical: 14, paddingHorizontal: 8,
    borderWidth: 1, borderColor: colors.ruleSoft,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  catLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.sm, color: colors.ink, marginTop: 6,
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
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.xl, color: colors.ink, marginTop: 2,
    paddingHorizontal: 16, paddingVertical: 10,
  },
  fieldInput: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.xl, color: colors.ink,
    paddingHorizontal: 16, paddingVertical: 10, padding: 0,
  },
  fieldSub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone,
    paddingHorizontal: 16, paddingBottom: 10, marginTop: -6,
  },
  fieldValueLong: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg, color: colors.ink,
    lineHeight: fontSizes.lg * 1.55, padding: 16, paddingTop: 8,
  },
  metaRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 14, paddingHorizontal: 16,
  },
  fieldDivider: { height: 1, backgroundColor: colors.ruleSoft, marginHorizontal: 16 },
  photoAdd: {
    flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'center',
    marginTop: 12, backgroundColor: colors.surface, borderRadius: r.lg,
    paddingVertical: 20, borderWidth: 1, borderColor: colors.ruleSoft, borderStyle: 'dashed',
  },
  photoAddText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.stone,
  },
  visibilityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 16,
    borderWidth: 1, borderColor: colors.ruleSoft,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  visibilitySelected: {
    borderColor: colors.ember, backgroundColor: '#FFF5F3',
  },
  visibilityIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.stone3, alignItems: 'center', justifyContent: 'center',
  },
  visibilityLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  visibilityDesc: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 2,
  },
  selectedDot: {
    width: 10, height: 10, borderRadius: 5, backgroundColor: colors.ember,
  },
  bottomActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: 10, padding: 20, paddingBottom: 36,
    backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.ruleSoft,
  },
  backBtn: {
    paddingHorizontal: 20, paddingVertical: 16, borderRadius: r.pill,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.ruleSoft,
  },
  backBtnText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'], color: colors.ink,
  },
  nextBtn: {
    flex: 1, backgroundColor: colors.ember, borderRadius: r.pill, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'] },
});
