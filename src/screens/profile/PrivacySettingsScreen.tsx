import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnLock, IcnUnlock, IcnGlobe, IcnUsers, IcnEye,
  IcnChevronRight, IcnShield,
} from '../../components/ui/Icons';
import { MonoLabel } from '../../components/ui/Chip';
import { colors, r, fontSizes } from '../../tokens';
import type { MeStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';

type Props = NativeStackScreenProps<MeStackParamList, 'PrivacySettings'>;

type ToggleSetting = {
  key: string;
  label: string;
  desc: string;
  value: boolean;
};

export function PrivacySettingsScreen({ navigation }: Props) {
  const logout = useAuthStore(s => s.logout);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };
  const [profileMode, setProfileMode] = useState<'acik' | 'yariAcik' | 'kapali'>('yariAcik');
  const [settings, setSettings] = useState<ToggleSetting[]>([
    { key: 'showActivity', label: 'Aktivite geçmişi', desc: 'Diğerleri etkinlik geçmişini görebilir', value: true },
    { key: 'showClubs', label: 'Cemiyet üyelikleri', desc: 'Hangi cemiyetlerde olduğun görünür', value: true },
    { key: 'showStats', label: 'İstatistikler', desc: 'Etkinlik sayısı ve rozetler', value: false },
    { key: 'allowMessages', label: 'Mesaj al', desc: 'Tanımadıklarından mesaj alabilirsin', value: true },
    { key: 'showOnMap', label: 'Haritada görün', desc: 'Genel haritada konumun görünür', value: false },
  ]);

  const toggle = (key: string) => {
    setSettings(prev => prev.map(s => s.key === key ? { ...s, value: !s.value } : s));
  };

  const PROFILE_MODES = [
    {
      key: 'acik' as const,
      label: 'Herkese Açık',
      desc: 'Tüm içerikler herkese görünür',
      icon: IcnGlobe,
      color: colors.forest,
    },
    {
      key: 'yariAcik' as const,
      label: 'Yarı Açık',
      desc: 'Profil görünür, aktivite seçimlik',
      icon: IcnUsers,
      color: colors.ocean,
    },
    {
      key: 'kapali' as const,
      label: 'Gizli',
      desc: 'Yalnızca takipçilerin görür',
      icon: IcnLock,
      color: colors.grape,
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <IcnArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gizlilik Ayarları</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
        {/* Profil modu */}
        <MonoLabel style={{ marginBottom: 12 }}>PROFİL MODU</MonoLabel>
        <View style={styles.modeCards}>
          {PROFILE_MODES.map(({ key, label, desc, icon: Icon, color }) => (
            <TouchableOpacity
              key={key}
              style={[styles.modeCard, profileMode === key && { borderColor: color, backgroundColor: color + '12' }]}
              onPress={() => setProfileMode(key)}
              activeOpacity={0.85}
            >
              <View style={[styles.modeIcon, profileMode === key && { backgroundColor: color }]}>
                <Icon size={18} color={profileMode === key ? '#fff' : colors.stone} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modeLabel, profileMode === key && { color }]}>{label}</Text>
                <Text style={styles.modeDesc}>{desc}</Text>
              </View>
              {profileMode === key && (
                <View style={[styles.selectedDot, { backgroundColor: color }]} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Görünürlük ayarları */}
        <MonoLabel style={{ marginTop: 28, marginBottom: 12 }}>GÖRÜNÜRLÜK</MonoLabel>
        <View style={styles.settingsCard}>
          {settings.map(({ key, label, desc, value }, i) => (
            <View key={key}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.settingRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>{label}</Text>
                  <Text style={styles.settingDesc}>{desc}</Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={() => toggle(key)}
                  trackColor={{ false: colors.stone3, true: colors.ember + '60' }}
                  thumbColor={value ? colors.ember : colors.surface}
                  ios_backgroundColor={colors.stone3}
                />
              </View>
            </View>
          ))}
        </View>

        {/* KVKK / Veri */}
        <MonoLabel style={{ marginTop: 28, marginBottom: 12 }}>VERİ VE GİZLİLİK</MonoLabel>
        <View style={styles.settingsCard}>
          {[
            { label: 'Kişisel Verilerimi İndir', desc: 'Tüm verilerin ZIP formatında' },
            { label: 'KVKK Aydınlatma Metni', desc: 'Kişisel veri işleme politikası' },
            { label: 'Kullanım Koşulları', desc: 'CemiApp kullanım şartları' },
            { label: 'Hesabı Sil', desc: 'Tüm verilerin kalıcı olarak silinir', danger: true },
          ].map(({ label, desc, danger }, i) => (
            <View key={label}>
              {i > 0 && <View style={styles.divider} />}
              <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingLabel, danger && { color: '#D63A1C' }]}>{label}</Text>
                  <Text style={styles.settingDesc}>{desc}</Text>
                </View>
                <IcnChevronRight size={18} color={danger ? '#D63A1C' : colors.stone} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Hesap güvenliği */}
        <MonoLabel style={{ marginTop: 28, marginBottom: 12 }}>HESAP GÜVENLİĞİ</MonoLabel>
        <View style={styles.settingsCard}>
          {[
            { label: 'Telefon Numarası', value: '+90 555 *** ** 89' },
            { label: 'İki Faktörlü Doğrulama', value: 'Aktif değil', warn: true },
          ].map(({ label, value, warn }, i) => (
            <View key={label}>
              {i > 0 && <View style={styles.divider} />}
              <TouchableOpacity style={styles.settingRow} activeOpacity={0.7}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.settingLabel}>{label}</Text>
                  <Text style={[styles.settingDesc, warn && { color: colors.amber }]}>{value}</Text>
                </View>
                <IcnChevronRight size={18} color={colors.stone} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Çıkış Yap */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        {/* Güvenlik rozeti */}
        <View style={styles.securityBadge}>
          <IcnShield size={20} color={colors.forest} />
          <View>
            <Text style={styles.securityTitle}>Verileriniz güvende</Text>
            <Text style={styles.securitySub}>CemiApp KVKK'ya tam uyumludur.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 14,
    borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  headerTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  modeCards: { gap: 10 },
  modeCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 16,
    borderWidth: 1, borderColor: colors.ruleSoft,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  modeIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.stone3, alignItems: 'center', justifyContent: 'center',
  },
  modeLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  modeDesc: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 2,
  },
  selectedDot: { width: 10, height: 10, borderRadius: 5 },
  settingsCard: {
    backgroundColor: colors.surface, borderRadius: r.lg, padding: 4,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
  },
  settingLabel: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.ink,
  },
  settingDesc: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 1,
  },
  divider: { height: 1, backgroundColor: colors.ruleSoft, marginHorizontal: 16 },
  logoutBtn: {
    marginTop: 24, backgroundColor: '#FFF0EE',
    borderRadius: r.pill, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1, borderColor: '#FFD5CE',
  },
  logoutText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: '#D63A1C',
  },
  securityBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginTop: 20, backgroundColor: '#F0FAF4', borderRadius: r.md, padding: 14,
    borderWidth: 1, borderColor: '#C8EDD8',
  },
  securityTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: colors.forest,
  },
  securitySub: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.forest + 'AA',
  },
});
