import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { supabase } from '@/services/supabase';
import { Ionicons } from '@expo/vector-icons';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator, Alert, Image,
  ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // margenes seguros
import { useTheme } from '../theme';

export default function EditProfileScreen() {
  const { user, refreshUser } = useAuth();
  const router = useRouter()
  const { theme } = useTheme()
  const { colors, typography, spacing, borderRadius } = theme
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar_url ?? null);
  const [nombre, setNombre] = useState(user?.nombre ?? '');
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordMismatch =
    confirmPassword !== '' && confirmPassword !== newPassword

  // Seleccionar foto
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso necesario', 'Necesitamos acceso a tu galería');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // Subir foto a Supabase
  const uploadAvatar = async (uri: string): Promise<string | null> => {
    try {
      const fileName = `${user!.id_usuario}_${Date.now()}.jpg`;
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, decode(base64), {
          contentType: 'image/jpeg',
          upsert: true,
        });
      if (error) {
        console.error('Upload error:', error);
        return null;
      }
      const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
      return data.publicUrl;
    } catch (e) {
      console.error('Upload error:', e);
      return null;
    }
  };


  // Guardar cambios
  const handleSave = async () => {
    setSaving(true);
    try {
      let avatar_url = user?.avatar_url ?? null;
      if (avatarUri && avatarUri !== user?.avatar_url) {
        const uploadedUrl = await uploadAvatar(avatarUri);
        if (uploadedUrl) avatar_url = uploadedUrl;
      }
      await api.put('/api/users/profile', { nombre: nombre || undefined, avatar_url });
      await refreshUser();
      Alert.alert('✅', t('editProfile.saved') || 'Cambios guardados');
      router.back();
    } catch (e) {
      Alert.alert('Error', t('editProfile.saveError') || 'Error');
    } finally {
      setSaving(false);
    }
  };


  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      paddingTop: insets.top,
    }]}>
      <ScrollView
        showsVerticalScrollIndicator={false} // se oculta
        keyboardShouldPersistTaps="handled" // como afectan los taps con el teclado
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <View style={{ paddingHorizontal: spacing.screenH, paddingTop: 16 }}>

          {/* HEADER — back (izq) + guardar ícono (der) */}
          <View style={[styles.row, { marginBottom: spacing[8] }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.iconBtn, {
                borderRadius: borderRadius.button,
                borderColor: colors.border,
              }]}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {/* Botón guardar en el header (ícono de disco/save) */}
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[styles.iconBtn, {
                borderRadius: borderRadius.button,
                borderColor: colors.primary,
                backgroundColor: colors.primary,
                opacity: saving ? 0.5 : 1,
              }]}
              activeOpacity={0.8}
            >
              {saving
                ? <ActivityIndicator size="small" color="#fff" />
                : <Ionicons name="save-outline" size={18} color={colors.textInverse ?? '#fff'} />
              }
            </TouchableOpacity>

          </View>

          {/* AVATAR circular + cámara */}
          <View style={[styles.centered, { marginBottom: spacing[9] }]}>
            <View style={styles.avatarWrap}>
              {/* Círculo de avatar */}
              <View style={[styles.avatarCircle, { borderColor: colors.primaryBorder, overflow: 'hidden' }]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={{ width: 88, height: 88, borderRadius: 44 }} />
                ) : (
                  <Ionicons name="person" size={40} color={colors.primary} />
                )}
              </View>
              {/* Botón cámara */}
              <TouchableOpacity onPress={pickImage} style={[styles.cameraBtn, { borderColor: colors.background }]}>
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={pickImage} style={{ marginTop: spacing[3] }}>
              <Text style={{
                color: colors.primary,
                fontFamily: typography.fontFamily.semiBold,
                fontSize: typography.fontSize.sm,
              }}>
                {t('editProfile.changePhoto')}
              </Text>
            </TouchableOpacity>
          </View>

          {/* NOMBRE */}
          <View style={{ marginBottom: spacing[5] }}>
            <Text style={[styles.label, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.semiBold,
              marginBottom: spacing[2],
            }]}>
              {t('editProfile.username')}
            </Text>
            <View style={[styles.inputRow, {
              borderRadius: borderRadius.input,
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
            }]}>
              <Ionicons name="person-outline" size={16} color={colors.textTertiary} style={{ marginLeft: 14 }} />
              <TextInput
                style={[styles.inputInner, {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.md,
                }]}
                value={nombre}
                onChangeText={setNombre}
                placeholder={t('editProfile.usernamePlaceholder') || 'Tu nombre'}
                placeholderTextColor={colors.inputPlaceholder}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* EMAIL */}
          <View style={{ marginBottom: spacing[5] }}>
            <Text style={[styles.label, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.semiBold,
              marginBottom: spacing[2],
            }]}>
              {t('editProfile.email')}
            </Text>
            <View style={[styles.readonlyField, {
              borderRadius: borderRadius.input,
              borderColor: colors.border,
              backgroundColor: colors.inputBackground,
            }]}>
              <Ionicons name="mail-outline" size={16} color={colors.textTertiary} style={{ marginRight: 10 }} />
              <Text style={{
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.medium,
                fontSize: typography.fontSize.md,
                flex: 1,
              }}>
                {user?.email ?? ''}
              </Text>
            </View>
          </View>

          {/* DIVIDER */}
          <View style={[styles.divider, {
            backgroundColor: colors.divider,
            marginVertical: spacing[6],
          }]} />

          {/* NUEVA CONTRASEÑA */}
          <View style={{ marginBottom: spacing[5] }}>
            <Text style={[styles.label, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.semiBold,
              marginBottom: spacing[2],
            }]}>
              {t('editProfile.newPassword')}
            </Text>
            <View style={[styles.inputRow, {
              borderRadius: borderRadius.input,
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
            }]}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textTertiary} style={{ marginLeft: 14 }} />
              <TextInput
                style={[styles.inputInner, {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.md,
                }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t('editProfile.passwordPlaceholder')}
                placeholderTextColor={colors.inputPlaceholder}
                secureTextEntry={!showPass}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowPass(v => !v)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPass ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CONFIRMAR CONTRASEÑA */}
          <View style={{ marginBottom: spacing[7] }}>
            <Text style={[styles.label, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.semiBold,
              marginBottom: spacing[2],
            }]}>
              {t('editProfile.confirmPassword')}
            </Text>
            <View style={[styles.inputRow, {
              borderRadius: borderRadius.input,
              backgroundColor: colors.inputBackground,
              borderColor: passwordMismatch ? colors.error : colors.inputBorder,
            }]}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.textTertiary} style={{ marginLeft: 14 }} />
              <TextInput
                style={[styles.inputInner, {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.md,
                }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('editProfile.confirmPlaceholder')}
                placeholderTextColor={colors.inputPlaceholder}
                secureTextEntry={!showConfirm}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                onPress={() => setShowConfirm(v => !v)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
            {passwordMismatch && (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={13} color={colors.error} />
                <Text style={{
                  color: colors.error,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.xs,
                }}>
                  {t('editProfile.passwordMismatch')}
                </Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  centered: { alignItems: 'center' },

  iconBtn: {
    width: 38, height: 38,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Wrapper para posicionar el botón de cámara */
  avatarWrap: {
    position: 'relative',
    width: 88,
    height: 88,
  },

  /* Avatar circular */
  avatarCircle: {
    width: 88, height: 88,
    borderRadius: 44,           // circular
    backgroundColor: '#1A2744',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Botón cámara superpuesto */
  cameraBtn: {
    position: 'absolute',
    bottom: -4, right: -4,
    width: 30, height: 30,
    borderRadius: 15,           // circular
    backgroundColor: '#4C8DFF',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  label: { fontSize: 10, letterSpacing: 1 },

  readonlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
  },
  autoTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  inputInner: { flex: 1, padding: 14 },
  eyeBtn: { paddingHorizontal: 14 },

  divider: { height: 1 },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
})