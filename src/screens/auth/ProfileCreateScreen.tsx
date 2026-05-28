import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IcnArrowLeft, IcnCamera, IcnPin, IcnArrow } from '../../components/ui/Icons';
import { MonoLabel } from '../../components/ui/Chip';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes } from '../../tokens';
import type { AuthStackParamList } from '../../types';
import { authService } from '../../services/authService';
import { pickImageOrCamera } from '../../hooks/useImagePicker';

type Props = NativeStackScreenProps<AuthStackParamList, 'ProfileCreate'>;

const USERNAME_REGEX = /^[a-z0-9_.]*$/;

export function ProfileCreateScreen({ navigation, route }: Props) {
  const phone = (route.params as any)?.phone as string | undefined;
  const firebaseUid = (route.params as any)?.firebaseUid as string | undefined;
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [usernameAvail, setUsernameAvail] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUsername = (val: string) => {
    const clean = val.toLowerCase().replace(/[^a-z0-9_.]/g, '');
    setUsername(clean);
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    if (clean.length < 3) {
      setUsernameAvail(true);
      setUsernameChecking(false);
      return;
    }
    setUsernameChecking(true);
    usernameTimer.current = setTimeout(async () => {
      try {
        const avail = await authService.checkUsername(clean);
        setUsernameAvail(avail);
      } catch {
        setUsernameAvail(true);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);
  };

  const usernameAvailable = username.length >= 3 && usernameAvail && !usernameChecking;
  const canContinue = name.trim().length > 0 && usernameAvailable;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView style={styles.root} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <IcnArrowLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <MonoLabel>3 / 4</MonoLabel>
        </View>

        {/* Başlık */}
        <Animated.View entering={FadeInDown.delay(60)} style={styles.titleArea}>
          <Text style={styles.title}>Kendini tanıt.</Text>
          <Text style={styles.sub}>Profilini sonradan istediğin zaman güncelleyebilirsin.</Text>
        </Animated.View>

        {/* Avatar */}
        <Animated.View entering={FadeInDown.delay(120)} style={styles.avatarArea}>
          <View style={{ position: 'relative' }}>
            <PhotoSlot
              uri={avatarUri ?? undefined}
              tone="1"
              height={100}
              width={100}
              style={{ borderRadius: 50 }}
            >
              {!avatarUri && (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 40, fontFamily: 'Manrope_800ExtraBold' }}>
                    {name.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
            </PhotoSlot>
            <TouchableOpacity
              style={styles.cameraBtn}
              activeOpacity={0.85}
              onPress={async () => {
                const uri = await pickImageOrCamera();
                if (uri) setAvatarUri(uri);
              }}
            >
              <IcnCamera size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Form alanları */}
        <Animated.View entering={FadeInDown.delay(180)}>
        <View style={styles.formCard}>
          {/* Ad Soyad */}
          <View style={[styles.fieldRow, styles.fieldBorder]}>
            <View style={{ flex: 1 }}>
              <MonoLabel style={{ fontSize: 9 }}>AD SOYAD</MonoLabel>
              <TextInput
                style={styles.fieldInput}
                value={name}
                onChangeText={setName}
                placeholder="Adın soyadın"
                placeholderTextColor={colors.stone2}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Kullanıcı adı */}
          <View style={[styles.fieldRow, styles.fieldBorder]}>
            <View style={{ flex: 1 }}>
              <MonoLabel style={{ fontSize: 9 }}>KULLANICI ADI</MonoLabel>
              <TextInput
                style={styles.fieldInput}
                value={`@${username}`}
                onChangeText={v => handleUsername(v.startsWith('@') ? v.slice(1) : v)}
                placeholder="@kullanici.adi"
                placeholderTextColor={colors.stone2}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {username.length >= 3 && (
              usernameChecking
                ? <ActivityIndicator size="small" color={colors.stone} />
                : (
                  <View style={styles.availableBadge}>
                    <View style={[styles.dot, { backgroundColor: usernameAvail ? colors.forest : colors.ember }]} />
                    <Text style={[styles.availableText, { color: usernameAvail ? colors.forest : colors.ember }]}>
                      {usernameAvail ? 'UYGUN' : 'ALINDI'}
                    </Text>
                  </View>
                )
            )}
          </View>

          {/* Şehir (sabit) */}
          <View style={styles.fieldRow}>
            <IcnPin size={20} color={colors.ember} />
            <View style={{ flex: 1 }}>
              <MonoLabel style={{ fontSize: 9 }}>ŞEHİR</MonoLabel>
              <Text style={styles.fieldValue}>Elazığ, Türkiye</Text>
            </View>
          </View>
        </View>
        </Animated.View>

        {/* Bio */}
        <Animated.View entering={FadeInDown.delay(240)}>
        <View style={styles.bioCard}>
          <View style={styles.bioHeader}>
            <MonoLabel>KISA BİYOGRAFİ</MonoLabel>
            <Text style={[styles.bioCount, bio.length > 130 && { color: colors.ember }]}>
              {bio.length} / 140
            </Text>
          </View>
          <TextInput
            style={styles.bioInput}
            value={bio}
            onChangeText={v => v.length <= 140 && setBio(v)}
            placeholder="Kendini kısaca anlat..."
            placeholderTextColor={colors.stone2}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
        </Animated.View>

        {/* Devam */}
        <Animated.View entering={FadeInDown.delay(300)}>
        <TouchableOpacity
          style={[styles.btnEmber, !canContinue && styles.btnDisabled]}
          onPress={() => navigation.navigate('Interests', { name: name.trim(), username, bio, phone, firebaseUid })}
          disabled={!canContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Devam et</Text>
          <IcnArrow size={18} color="#fff" />
        </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
  titleArea: { marginBottom: 24 },
  title: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.display,
    color: colors.ink, lineHeight: fontSizes.display * 1.02, letterSpacing: -0.8,
  },
  sub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.stone, marginTop: 10, lineHeight: fontSizes.lg * 1.55,
  },
  avatarArea: { alignItems: 'center', marginBottom: 26 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.ink, borderWidth: 3, borderColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  formCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 4, marginBottom: 24,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  fieldRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, paddingHorizontal: 16,
  },
  fieldBorder: { borderBottomWidth: 1, borderBottomColor: colors.ruleSoft },
  fieldInput: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes['2xl'],
    color: colors.ink, marginTop: 2, padding: 0,
  },
  fieldValue: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes['2xl'],
    color: colors.ink, marginTop: 2,
  },
  availableBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  availableText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.base },
  bioCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 16, marginBottom: 28,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  bioHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  bioCount: { fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.sm, color: colors.stone2 },
  bioInput: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.xl,
    color: colors.ink, lineHeight: fontSizes.xl * 1.5, marginTop: 8,
    padding: 0, minHeight: 60,
  },
  btnEmber: {
    backgroundColor: colors.ember, borderRadius: r.pill, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'] },
});
