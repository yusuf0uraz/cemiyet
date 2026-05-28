import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  TextInput, TouchableWithoutFeedback, KeyboardAvoidingView, Platform,
} from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, r, fontSizes } from '../../tokens';

interface Props {
  visible: boolean;
  clubName: string;
  membershipModel: 'acik' | 'onay' | 'kapali';
  onConfirm: (note: string) => void;
  onCancel: () => void;
}

export function JoinApplicationModal({ visible, clubName, membershipModel, onConfirm, onCancel }: Props) {
  const [note, setNote] = useState('');
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  const isApproval = membershipModel === 'onay';

  return (
    <Modal transparent visible animationType="none" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={onCancel}>
          <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
            <TouchableWithoutFeedback>
              <Animated.View
                entering={SlideInDown.springify().damping(18)}
                style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}
              >
                <View style={styles.handle} />

                <Text style={styles.title}>
                  {isApproval ? `"${clubName}" Başvurusu` : `"${clubName}" Cemiyetine Katıl`}
                </Text>

                {isApproval ? (
                  <>
                    <Text style={styles.subtitle}>
                      Bu cemiyet onaylı üyelik gerektiriyor. Kendini kısaca tanıt, neden katılmak istediğini belirt.
                    </Text>

                    <View style={styles.fieldCard}>
                      <Text style={styles.fieldLabel}>KENDİNİ TANIT</Text>
                      <TextInput
                        style={styles.input}
                        value={note}
                        onChangeText={v => v.length <= 300 && setNote(v)}
                        placeholder="Neden bu cemiyete katılmak istiyorsun? İlgi alanlarını, deneyimlerini paylaş..."
                        placeholderTextColor={colors.stone2}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        autoFocus
                      />
                      <Text style={[styles.charCount, note.length > 260 && { color: colors.ember }]}>
                        {note.length}/300
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[styles.btnEmber, note.trim().length < 10 && { opacity: 0.5 }]}
                      onPress={() => onConfirm(note.trim())}
                      disabled={note.trim().length < 10}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.btnEmberText}>Başvuru Gönder</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={styles.subtitle}>
                      Bu cemiyete katılmak istediğini onaylıyor musun?
                    </Text>
                    <TouchableOpacity style={styles.btnEmber} onPress={() => onConfirm('')} activeOpacity={0.85}>
                      <Text style={styles.btnEmberText}>Evet, Katıl</Text>
                    </TouchableOpacity>
                  </>
                )}

                <TouchableOpacity style={styles.btnGhost} onPress={onCancel}>
                  <Text style={styles.btnGhostText}>İptal</Text>
                </TouchableOpacity>
              </Animated.View>
            </TouchableWithoutFeedback>
          </Animated.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.bg, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 12,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2, backgroundColor: colors.stone3,
    alignSelf: 'center', marginBottom: 20,
  },
  title: {
    fontFamily: 'Manrope_800ExtraBold', fontSize: fontSizes['4xl'],
    color: colors.ink, letterSpacing: -0.3, marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.stone, lineHeight: fontSizes.lg * 1.5, marginBottom: 20,
  },
  fieldCard: {
    backgroundColor: colors.surface, borderRadius: r.lg,
    padding: 16, marginBottom: 16,
    shadowColor: colors.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2,
  },
  fieldLabel: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: 9,
    color: colors.stone, letterSpacing: 0.5, marginBottom: 10,
  },
  input: {
    fontFamily: 'Manrope_500Medium', fontSize: fontSizes.lg,
    color: colors.ink, minHeight: 100, padding: 0,
    lineHeight: fontSizes.lg * 1.5,
  },
  charCount: {
    fontFamily: 'JetBrainsMono_500Medium', fontSize: fontSizes.sm,
    color: colors.stone2, textAlign: 'right', marginTop: 8,
  },
  btnEmber: {
    backgroundColor: colors.ember, borderRadius: r.pill, paddingVertical: 16,
    alignItems: 'center', marginBottom: 10,
    shadowColor: colors.ember, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  btnEmberText: {
    fontFamily: 'Manrope_700Bold', fontSize: fontSizes['2xl'], color: '#fff',
  },
  btnGhost: {
    alignItems: 'center', paddingVertical: 12,
  },
  btnGhostText: {
    fontFamily: 'Manrope_600SemiBold', fontSize: fontSizes.lg, color: colors.stone,
  },
});
