import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  IcnArrowLeft, IcnCamera, IcnCheck, IcnPin,
} from '../../components/ui/Icons';
import { Avatar } from '../../components/ui/Avatar';
import { MonoLabel } from '../../components/ui/Chip';
import { colors, r, fontSizes } from '../../tokens';
import type { MeStackParamList } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/authService';
import { pickImageOrCamera } from '../../hooks/useImagePicker';
import { uploadImage } from '../../services/uploadService';

type Props = NativeStackScreenProps<MeStackParamList, 'ProfileEdit'>;

export function ProfileEditScreen({ navigation }: Props) {
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const loading = useAuthStore(s => s.loading);

  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [city] = useState(user?.city ?? 'Elazığ, Türkiye');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [usernameAvail, setUsernameAvail] = useState(true);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [uploading, setUploading] = useState(false);
  const bioMaxLen = 140;
  const changed = name !== user?.name || username !== user?.username || bio !== user?.bio || !!avatarUri;
  const canSave = changed && usernameAvail && !usernameChecking && !uploading;

  const handleUsernameChange = (t: string) => {
    const cleaned = t.replace(/[^a-z0-9_.]/g, '');
    setUsername(cleaned);
    if (usernameTimer.current) clearTimeout(usernameTimer.current);
    if (cleaned === user?.username || cleaned.length < 3) {
      setUsernameAvail(true);
      setUsernameChecking(false);
      return;
    }
    setUsernameChecking(true);
    usernameTimer.current = setTimeout(async () => {
      try {
        const avail = await authService.checkUsername(cleaned);
        setUsernameAvail(avail);
      } catch {
        setUsernameAvail(true);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);
  };

  const handleSave = async () => {
    if ((!changed && !avatarUri) || loading) { navigation.goBack(); return; }
    let avatarUrl: string | undefined;
    if (avatarUri) {
      setUploading(true);
      try {
        avatarUrl = await uploadImage(avatarUri, 'avatar');
      } catch {
        // Upload başarısız olsa bile diğer alanları kaydet
      } finally {
        setUploading(false);
      }
    }
    await updateProfile({ name, username, bio, ...(avatarUrl ? { avatarUrl } : {}) });
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <IcnArrowLeft size={20} color={colors.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>
        <TouchableOpacity
          style={[styles.saveBtn, (!canSave || loading) && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={!canSave || loading}
          activeOpacity={0.85}
        >
          <IcnCheck size={16} color="#fff" />
          <Text style={styles.saveBtnText}>{uploading ? 'Yükleniyor...' : loading ? 'Kaydediliyor...' : 'Kaydet'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Avatar değiştir */}
        <View style={styles.avatarSection}>
          <View style={{ position: 'relative', alignSelf: 'center' }}>
            <Avatar tone={user?.avatarTone ?? '1'} size={88} name={user?.name ?? ''} uri={avatarUri ?? undefined} />
            <TouchableOpacity
              style={styles.cameraBtn}
              activeOpacity={0.85}
              onPress={async () => {
                const uri = await pickImageOrCamera();
                if (uri) setAvatarUri(uri);
              }}
            >
              <IcnCamera size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.changePhotoBtn}
            onPress={async () => {
              const uri = await pickImageOrCamera();
              if (uri) setAvatarUri(uri);
            }}
          >
            <Text style={styles.changePhotoText}>Fotoğrafı değiştir</Text>
          </TouchableOpacity>
        </View>

        {/* Ad Soyad */}
        <View style={styles.fieldGroup}>
          <MonoLabel style={styles.fieldLabel}>AD SOYAD</MonoLabel>
          <View style={styles.inputWrap}>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ad ve soyad"
              placeholderTextColor={colors.stone2}
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Kullanıcı adı */}
        <View style={styles.fieldGroup}>
          <MonoLabel style={styles.fieldLabel}>KULLANICI ADI</MonoLabel>
          <View style={styles.inputWrap}>
            <Text style={styles.atSign}>@</Text>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={username}
              onChangeText={handleUsernameChange}
              placeholder="kullanici.adi"
              placeholderTextColor={colors.stone2}
              autoCapitalize="none"
              returnKeyType="next"
            />
            {usernameChecking ? (
              <ActivityIndicator size="small" color={colors.stone} style={{ marginLeft: 4 }} />
            ) : usernameAvail ? (
              <View style={styles.availBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.availText}>UYGUN</Text>
              </View>
            ) : (
              <View style={[styles.availBadge, { backgroundColor: '#FEE8E5' }]}>
                <View style={[styles.greenDot, { backgroundColor: colors.ember }]} />
                <Text style={[styles.availText, { color: colors.ember }]}>ALINDI</Text>
              </View>
            )}
          </View>
          <Text style={styles.fieldHint}>Yalnızca harf, rakam, nokta ve alt çizgi</Text>
        </View>

        {/* Şehir */}
        <View style={styles.fieldGroup}>
          <MonoLabel style={styles.fieldLabel}>ŞEHİR</MonoLabel>
          <View style={[styles.inputWrap, styles.inputWrapDisabled]}>
            <IcnPin size={16} color={colors.stone} />
            <Text style={styles.inputDisabledText}>{city}</Text>
          </View>
          <Text style={styles.fieldHint}>Şehir konumundan otomatik belirlenir</Text>
        </View>

        {/* Bio */}
        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <MonoLabel style={styles.fieldLabel}>KISA BİYOGRAFİ</MonoLabel>
            <Text style={[
              styles.charCount,
              bio.length > bioMaxLen * 0.9 && { color: colors.ember },
            ]}>
              {bio.length} / {bioMaxLen}
            </Text>
          </View>
          <View style={[styles.inputWrap, styles.inputWrapMultiline]}>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={bio}
              onChangeText={(t) => t.length <= bioMaxLen && setBio(t)}
              placeholder="Kendinden bahset..."
              placeholderTextColor={colors.stone2}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Hesap bölümü */}
        <View style={styles.sectionDivider}>
          <MonoLabel>HESAP</MonoLabel>
        </View>

        {[
          { label: 'Telefon Numarası', value: '+90 555 *** ** 89', tappable: true },
          { label: 'E-posta', value: 'yusufuraz18@gmail.com', tappable: true },
          { label: 'Bağlı Hesaplar', value: 'Google · Apple', tappable: true },
        ].map(({ label, value, tappable }, i) => (
          <TouchableOpacity
            key={label}
            style={[styles.settingRow, i < 2 && styles.settingBorder]}
            activeOpacity={tappable ? 0.7 : 1}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>{label}</Text>
              <Text style={styles.settingValue}>{value}</Text>
            </View>
            {tappable && (
              <Text style={styles.changeLink}>Değiştir</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: colors.ruleSoft,
    backgroundColor: colors.surface,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xl, color: colors.ink,
  },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: colors.ember, paddingHorizontal: 14, paddingVertical: 8, borderRadius: r.pill,
  },
  saveBtnDisabled: { backgroundColor: colors.stone3 },
  saveBtnText: { fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: '#fff' },
  content: { padding: 20, paddingBottom: 60 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  cameraBtn: {
    position: 'absolute', bottom: 0, right: 0,
    width: 30, height: 30, borderRadius: 15, backgroundColor: colors.ink,
    borderWidth: 2, borderColor: colors.bg, alignItems: 'center', justifyContent: 'center',
  },
  changePhotoBtn: { marginTop: 10 },
  changePhotoText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.ember,
  },
  fieldGroup: { marginBottom: 20 },
  fieldLabel: { marginBottom: 8 },
  fieldLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 },
  charCount: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.sm, color: colors.stone2,
  },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderRadius: r.md, paddingHorizontal: 14, paddingVertical: 2,
    borderWidth: 1, borderColor: colors.ruleSoft,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 2, elevation: 1,
  },
  inputWrapDisabled: { backgroundColor: colors.bg },
  inputWrapMultiline: { paddingVertical: 12, alignItems: 'flex-start' },
  atSign: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.xl, color: colors.stone,
    marginRight: 2,
  },
  input: {
    flex: 1,
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.xl, color: colors.ink,
    paddingVertical: 14, paddingHorizontal: 0,
  },
  inputDisabledText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.xl, color: colors.stone,
    marginLeft: 8, paddingVertical: 14,
  },
  inputMultiline: {
    paddingVertical: 0, minHeight: 80, lineHeight: fontSizes.xl * 1.55,
  },
  availBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F0FAF4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: r.pill,
  },
  greenDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.forest },
  availText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.xs, color: colors.forest,
  },
  fieldHint: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.sm, color: colors.stone2, marginTop: 6,
  },
  sectionDivider: {
    marginTop: 12, marginBottom: 12, paddingTop: 20,
    borderTopWidth: 1, borderTopColor: colors.ruleSoft,
  },
  settingRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 14,
  },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: colors.ruleSoft },
  settingLabel: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.lg, color: colors.ink,
  },
  settingValue: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.md, color: colors.stone, marginTop: 2,
  },
  changeLink: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes.md, color: colors.ember,
  },
});
