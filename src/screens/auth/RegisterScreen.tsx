import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Svg, { Rect, Circle, Polygon } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnChevronDown, IcnCheck, IcnMessage,
} from '../../components/ui/Icons';
import { MonoLabel } from '../../components/ui/Chip';
import { colors, r, fontSizes } from '../../tokens';
import type { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [localError, setLocalError] = useState('');
  const sendCode = useAuthStore(s => s.sendCode);
  const loading = useAuthStore(s => s.loading);

  const handleSend = async () => {
    if (!agreed || phone.length < 10 || loading) return;
    setLocalError('');
    const fullPhone = `+90${phone}`;
    const { ok, devCode } = await sendCode(fullPhone);
    if (ok) {
      navigation.navigate('SmsVerify', { phone: fullPhone });
    } else {
      const storeErr = useAuthStore.getState().error ?? 'Kod gönderilemedi';
      setLocalError(storeErr);
      // Backend erişilemese bile devam et (dev mod)
      if (!ok) setTimeout(() => navigation.navigate('SmsVerify', { phone: fullPhone }), 1200);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <IcnArrowLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <MonoLabel>1 / 4</MonoLabel>
        </View>

        {/* Başlık */}
        <Animated.View entering={FadeInDown.delay(60)} style={styles.titleArea}>
          <Text style={styles.title}>
            Telefon{'\n'}numaran ile{'\n'}
            <Text style={{ color: colors.ember }}>başla.</Text>
          </Text>
          <Text style={styles.sub}>
            6 haneli doğrulama kodu göndereceğiz.
          </Text>
        </Animated.View>

        {/* Telefon input */}
        <Animated.View entering={FadeInDown.delay(120)}>
          <View style={styles.inputCard}>
            <MonoLabel>CEP TELEFONU</MonoLabel>
            <View style={styles.phoneRow}>
              <View style={styles.countryPicker}>
                <Svg width={22} height={15} viewBox="0 0 3 2" style={{ borderRadius: 2 }}>
                  <Rect width="3" height="2" fill="#E30A17" />
                  <Circle cx="1.25" cy="1" r="0.5" fill="#fff" />
                  <Circle cx="1.35" cy="1" r="0.4" fill="#E30A17" />
                  <Polygon points="1.65,0.85 1.85,1 1.65,1.15 1.7,1" fill="#fff" />
                </Svg>
                <Text style={styles.dialCode}>+90</Text>
                <IcnChevronDown size={14} color={colors.stone} />
              </View>
              <TextInput
                style={styles.phoneInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="5__ ___ __ __"
                placeholderTextColor={colors.stone2}
                keyboardType="phone-pad"
                maxLength={11}
              />
            </View>
          </View>
        </Animated.View>

        {/* KVKK onayı */}
        <Animated.View entering={FadeInDown.delay(180)}>
          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            style={styles.checkRow}
            activeOpacity={0.85}
          >
            <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
              {agreed && <IcnCheck size={14} color="#fff" strokeWidth={3} />}
            </View>
            <Text style={styles.checkText}>
              <Text style={styles.checkLink}>Kullanım Şartları</Text>
              {' '}ve{' '}
              <Text style={styles.checkLink}>KVKK Aydınlatma Metni</Text>
              'ni okudum, kabul ediyorum.
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Hata mesajı */}
        {!!localError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {localError}</Text>
          </View>
        )}

        {/* Gönder butonu */}
        <Animated.View entering={FadeInDown.delay(240)}>
          <TouchableOpacity
            style={[styles.btnEmber, (!agreed || phone.length < 10 || loading) && styles.btnDisabled]}
            onPress={handleSend}
            disabled={!agreed || phone.length < 10 || loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{loading ? 'Gönderiliyor...' : 'Kod gönder'}</Text>
            <IcnArrowIcon />
          </TouchableOpacity>
        </Animated.View>

        {/* Ayırıcı */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>VEYA</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sosyal giriş */}
        <View style={styles.socialRow}>
          {[
            { label: 'Apple', icon: null },
            { label: 'Google', icon: null },
            { label: 'E-posta', icon: <IcnMessage size={15} color={colors.ink} /> },
          ].map(({ label, icon }, i) => (
            <TouchableOpacity key={i} style={styles.socialBtn} activeOpacity={0.85}>
              {icon}
              <Text style={styles.socialText}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function IcnArrowIcon() {
  const { IcnArrow: A } = require('../../components/ui/Icons');
  return <A size={18} color="#fff" />;
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
  titleArea: { marginBottom: 28 },
  title: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes.displayLg,
    color: colors.ink, lineHeight: fontSizes.displayLg * 1.02, letterSpacing: -1,
  },
  sub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.xl,
    color: colors.stone, marginTop: 14, lineHeight: fontSizes.xl * 1.55,
  },
  inputCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 18, marginBottom: 22,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  countryPicker: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.bg2, padding: 10, paddingHorizontal: 14, borderRadius: r.md,
  },
  dialCode: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes['3xl'], color: colors.ink },
  phoneInput: { flex: 1, fontFamily: 'Manrope_700Bold', fontSize: 22, color: colors.ink, letterSpacing: 0.4 },
  checkRow: {
    flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 28,
    padding: 12, paddingHorizontal: 14, backgroundColor: colors.surface, borderRadius: r.md,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: colors.rule,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkboxActive: { backgroundColor: colors.ember, borderColor: colors.ember },
  checkText: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md,
    lineHeight: fontSizes.md * 1.55, color: colors.stone, flex: 1,
  },
  checkLink: { color: colors.ink, fontFamily: 'Manrope_600SemiBold' },
  errorBox: { backgroundColor: '#FFF0EE', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText: { fontFamily: 'Manrope_600SemiBold', fontSize: 13, color: colors.ember },
  btnEmber: {
    backgroundColor: colors.ember, borderRadius: r.pill, paddingVertical: 18,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 10,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'] },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 32 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.rule },
  dividerText: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.sm,
    letterSpacing: 1.8, color: colors.stone2,
  },
  socialRow: { flexDirection: 'row', gap: 10, marginBottom: 32 },
  socialBtn: {
    flex: 1, paddingVertical: 14, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.rule, borderRadius: r.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  socialText: { fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.ink },
});
