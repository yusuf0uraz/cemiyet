import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CemiAppLogo } from '../../components/ui/CemiAppLogo';
import { IcnArrow } from '../../components/ui/Icons';
import { PhotoSlot } from '../../components/ui/Card';
import { colors, r, fontSizes, fontWeights } from '../../tokens';
import type { AuthStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

const { width: W, height: H } = Dimensions.get('window');

type Props = NativeStackScreenProps<AuthStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  const continueAsGuest = useAuthStore(s => s.continueAsGuest);
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colors.night, colors.night2]}
        style={StyleSheet.absoluteFill}
      />
      {/* Dekoratif arkaplan kartları */}
      <View style={[styles.deco, { opacity: 0.35 }]} pointerEvents="none">
        <PhotoSlot tone="1" height={240} width={200}
          style={{ position: 'absolute', top: 60, right: -40, borderRadius: 20, transform: [{ rotate: '8deg' }] }} />
        <PhotoSlot tone="2" height={220} width={180}
          style={{ position: 'absolute', top: 200, left: -50, borderRadius: 20, transform: [{ rotate: '-6deg' }] }} />
        <PhotoSlot tone="3" height={180} width={150}
          style={{ position: 'absolute', top: 320, right: 20, borderRadius: 20, transform: [{ rotate: '12deg' }] }} />
        <PhotoSlot tone="4" height={200} width={160}
          style={{ position: 'absolute', top: 380, left: 30, borderRadius: 20, transform: [{ rotate: '-3deg' }] }} />
      </View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <CemiAppLogo size={64} />
        </View>

        {/* İçerik */}
        <View style={styles.content}>
          <Text style={styles.headline}>
            Şehrindeki{'\n'}
            <Text style={{ color: colors.ember }}>her şey,</Text>{'\n'}
            cebinde.
          </Text>
          <Text style={styles.sub}>
            Cumartesi maçı, kitap kulübü, gün batımı yürüyüşü.
            Hepsi tek uygulamada.
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.btnEmber}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnEmberText}>Hemen başla</Text>
              <IcnArrow size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnOutline}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.85}
            >
              <Text style={styles.btnOutlineText}>Zaten hesabım var</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.guestBtn}
              onPress={continueAsGuest}
            >
              <Text style={styles.guestText}>Misafir olarak keşfet →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.night,
  },
  deco: {
    ...StyleSheet.absoluteFill,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 32,
  },
  logoArea: {
    paddingTop: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 24,
  },
  headline: {
    fontFamily: 'Manrope_800ExtraBold',
    fontSize: fontSizes.hero,
    color: '#fff',
    lineHeight: fontSizes.hero * 0.95,
    letterSpacing: -2,
  },
  sub: {
    fontFamily: 'Manrope_500Medium',
    fontSize: fontSizes['3xl'],
    lineHeight: fontSizes['3xl'] * 1.55,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 22,
    maxWidth: 320,
  },
  actions: {
    gap: 10,
    marginTop: 36,
  },
  btnEmber: {
    backgroundColor: colors.ember,
    borderRadius: r.pill,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: colors.ember,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  btnEmberText: {
    color: '#fff',
    fontFamily: 'Manrope_700Bold',
    fontSize: fontSizes['2xl'],
  },
  btnOutline: {
    borderRadius: r.pill,
    paddingVertical: 17,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    color: '#fff',
    fontFamily: 'Manrope_600SemiBold',
    fontSize: fontSizes['2xl'],
  },
  guestBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  guestText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: fontSizes.md,
    color: 'rgba(255,255,255,0.4)',
  },
});
