import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { IcnArrowLeft } from '../../components/ui/Icons';
import { MonoLabel } from '../../components/ui/Chip';
import { colors, r, fontSizes } from '../../tokens';
import type { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<AuthStackParamList, 'SmsVerify'>;

export function SmsVerifyScreen({ navigation, route }: Props) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const phone = route.params?.phone ?? '';

  const confirmFirebaseCode = useAuthStore(s => s.confirmFirebaseCode);
  const sendFirebaseCode = useAuthStore(s => s.sendFirebaseCode);

  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer(t => {
        if (t <= 1) { clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleKey = async (key: string) => {
    if (key === '⌫') {
      const idx = digits.findLastIndex(d => d !== '');
      if (idx >= 0) {
        const next = [...digits];
        next[idx] = '';
        setDigits(next);
      }
      return;
    }

    const emptyIdx = digits.findIndex(d => d === '');
    if (emptyIdx < 0 || key === '') return;

    const next = [...digits];
    next[emptyIdx] = key;
    setDigits(next);

    if (!next.every(d => d !== '')) return;

    setVerifying(true);
    setErrorMsg('');
    const code = next.join('');

    try {
      const { isNew, phone: verifiedPhone, firebaseUid } = await confirmFirebaseCode(code);
      if (isNew) {
        navigation.navigate('ProfileCreate', { phone: verifiedPhone, firebaseUid });
      }
      // isNew === false → confirmFirebaseCode içinde isLoggedIn = true → RootNavigator geçiş yapar
    } catch (err: any) {
      setErrorMsg(err?.message ?? 'Kod doğrulanamadı');
      setDigits(['', '', '', '', '', '']);
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setResendTimer(60);
    await sendFirebaseCode(phone);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.root} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <IcnArrowLeft size={20} color={colors.ink} />
          </TouchableOpacity>
          <MonoLabel>2 / 4</MonoLabel>
        </View>

        {/* Başlık */}
        <View style={styles.titleArea}>
          <Text style={styles.title}>Kodu gir.</Text>
          <Text style={styles.sub}>
            <Text style={{ color: colors.ink, fontFamily: 'Manrope_700Bold' }}>{phone}</Text>
            {' '}numarasına gönderilen 6 haneli kod.
          </Text>
        </View>

        {/* Digit kutuları */}
        <View style={styles.digitRow}>
          {digits.map((d, i) => {
            const isActive = i === digits.findIndex(x => x === '');
            return (
              <Animated.View key={i} entering={FadeIn.delay(i * 60)} style={{ flex: 1 }}>
                <View style={[
                  styles.digitBox,
                  d && styles.digitFilled,
                  isActive && !d && styles.digitActive,
                ]}>
                  {d ? (
                    <Text style={styles.digitText}>{d}</Text>
                  ) : isActive ? (
                    <View style={styles.cursor} />
                  ) : null}
                </View>
              </Animated.View>
            );
          })}
        </View>

        {/* Hata mesajı */}
        {!!errorMsg && (
          <View style={{ backgroundColor: '#FFF0EE', borderRadius: 10, padding: 12, marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: colors.ember, textAlign: 'center' }}>
              {errorMsg}
            </Text>
          </View>
        )}

        {verifying && (
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: colors.stone }}>
              Doğrulanıyor...
            </Text>
          </View>
        )}

        {/* Tekrar gönder */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Kod gelmedi mi?</Text>
          {resendTimer > 0 ? (
            <Text style={styles.resendTimer}>
              0:{String(resendTimer).padStart(2, '0')} sonra tekrar gönder
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend}>
              <Text style={[styles.resendTimer, { color: colors.ember }]}>Tekrar gönder</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* Sayısal klavye */}
      <View style={styles.keyboard}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((n, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.keyBtn, !n && styles.keyEmpty]}
            onPress={() => n && handleKey(n)}
            activeOpacity={0.7}
            disabled={verifying}
          >
            <Text style={styles.keyText}>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  root: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 16,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  titleArea: { marginBottom: 28 },
  title: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: fontSizes.displayLg,
    color: colors.ink,
    letterSpacing: -1,
  },
  sub: {
    fontFamily: 'Manrope_500Medium',
    fontSize: fontSizes.xl,
    color: colors.stone,
    marginTop: 12,
    lineHeight: fontSizes.xl * 1.55,
  },
  digitRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  digitBox: {
    flex: 1, height: 60,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.rule,
    borderRadius: r.md,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  digitFilled: {
    backgroundColor: colors.ember,
    borderColor: colors.ember,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  digitActive: {
    borderWidth: 2,
    borderColor: colors.ember,
  },
  digitText: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: 26,
    color: '#fff',
  },
  cursor: {
    width: 2, height: 26,
    backgroundColor: colors.ember,
  },
  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    paddingHorizontal: 18,
    backgroundColor: colors.surface,
    borderRadius: r.md,
    marginBottom: 24,
  },
  resendLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: fontSizes.lg,
    color: colors.stone,
  },
  resendTimer: {
    fontFamily: 'Manrope_700Bold',
    fontSize: fontSizes.lg,
    color: colors.stone,
  },
  keyboard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 14,
    paddingBottom: 36,
    gap: 10,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  keyBtn: {
    width: '30%',
    height: 52,
    backgroundColor: colors.bg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexBasis: '30%',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
  },
  keyText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 22,
    color: colors.ink,
  },
});
