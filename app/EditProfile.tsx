import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // margenes seguros
import { useTheme } from '../theme';

export default function EditProfileScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { colors, typography, spacing, borderRadius } = theme
  const insets = useSafeAreaInsets()

  const [email, setEmail]                     = useState('')
  const [newPassword, setNewPassword]         = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]               = useState(false)
  const [showConfirm, setShowConfirm]         = useState(false)

  const passwordMismatch =
    confirmPassword !== '' && confirmPassword !== newPassword

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
              style={[styles.iconBtn, {
                borderRadius: borderRadius.button,
                borderColor: colors.primary,
                backgroundColor: colors.primary,
              }]}
              activeOpacity={0.8}
            >
              <Ionicons name="save-outline" size={18} color={colors.textInverse ?? '#fff'} />
            </TouchableOpacity>
          </View>

          {/* AVATAR circular + cámara */}
          <View style={[styles.centered, { marginBottom: spacing[9] }]}>
            <View style={styles.avatarWrap}>
              {/* Círculo de avatar */}
              <View style={[styles.avatarCircle, { borderColor: colors.primaryBorder }]}>
                <Ionicons name="person" size={40} color={colors.primary} />
              </View>
              {/* Botón cámara */}
              <TouchableOpacity style={[styles.cameraBtn, {
                borderColor: colors.background,
              }]}>
                <Ionicons name="camera" size={14} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ marginTop: spacing[3] }}>
              <Text style={{
                color: colors.primary,
                fontFamily: typography.fontFamily.semiBold,
                fontSize: typography.fontSize.sm,
              }}>
                Cambiar foto
              </Text>
            </TouchableOpacity>
          </View>

          {/* USUARIO (solo lectura) */}
          <View style={{ marginBottom: spacing[5] }}>
            <Text style={[styles.label, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.semiBold,
              marginBottom: spacing[2],
            }]}>
              USUARIO
            </Text>
            <View style={[styles.readonlyField, {
              borderRadius: borderRadius.input,
              borderColor: colors.border,
              backgroundColor: colors.inputBackground,
            }]}>
              <Ionicons name="person-outline" size={16} color={colors.textTertiary} style={{ marginRight: 10 }} />
              <Text style={{
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.medium,
                fontSize: typography.fontSize.md,
                flex: 1,
              }}>
                usuario1234
              </Text>
              <View style={[styles.autoTag, { backgroundColor: colors.primaryMuted }]}>
                <Text style={{
                  color: colors.textTertiary,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.xs,
                }}>
                  Auto-asignado
                </Text>
              </View>
            </View>
          </View>

          {/* EMAIL */}
          <View style={{ marginBottom: spacing[5] }}>
            <Text style={[styles.label, {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.semiBold,
              marginBottom: spacing[2],
            }]}>
              CORREO ELECTRÓNICO
            </Text>
            <View style={[styles.inputRow, {
              borderRadius: borderRadius.input,
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
            }]}>
              <Ionicons name="mail-outline" size={16} color={colors.textTertiary} style={{ marginLeft: 14 }} />
              <TextInput
                style={[styles.inputInner, {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.md,
                }]}
                value={email}
                onChangeText={setEmail}
                placeholder="tu@correo.com"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
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
              NUEVA CONTRASEÑA
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
                placeholder="Dejar vacío para no cambiar"
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
              CONFIRMAR CONTRASEÑA
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
                placeholder="Repite la contraseña"
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
                  Las contraseñas no coinciden
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