import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import {
  ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useTheme } from '../theme'

export default function EditProfileScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { colors, typography, spacing, borderRadius } = theme
  const insets = useSafeAreaInsets()

  const [email, setEmail]               = useState('')
  const [newPassword, setNewPassword]   = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass]         = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)

  const passwordMismatch =
    confirmPassword !== '' && confirmPassword !== newPassword

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      paddingTop: insets.top,
    }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        <View style={{ paddingHorizontal: spacing.screenH, paddingTop: 16 }}>

          {/* HEADER */}
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

            <Text style={{
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.lg,
            }}>
              Editar Perfil
            </Text>

            <View style={{ width: 38 }} />
          </View>

          {/* AVATAR */}
          <View style={[styles.centered, { marginBottom: spacing[9] }]}>
            <View style={[styles.avatarWrap, {
              borderRadius: borderRadius.xl,
              borderColor: colors.primaryBorder,
            }]}>
              <Ionicons name="person" size={40} color={colors.primary} />
              <TouchableOpacity style={[styles.cameraBtn, {
                borderRadius: borderRadius.sm,
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
                Viajero #1
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

          {/* CERRAR SESIÓN */}
          <TouchableOpacity
            style={[styles.signOutBtn, {
              borderRadius: borderRadius.button,
              borderColor: colors.errorMuted,
            }]}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.error} />
            <Text style={{
              color: colors.error,
              fontFamily: typography.fontFamily.semiBold,
              fontSize: typography.fontSize.sm,
            }}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>

      {/* BOTÓN GUARDAR FIJO */}
      <View style={[styles.saveBar, {
        paddingBottom: insets.bottom + 12,
        borderTopColor: colors.border,
        backgroundColor: colors.background,
      }]}>
        <TouchableOpacity
          style={[styles.saveBtn, {
            borderRadius: borderRadius.button,
            backgroundColor: colors.primary,
          }]}
          activeOpacity={0.85}
        >
          <Ionicons name="checkmark" size={18} color={colors.textInverse} />
          <Text style={{
            color: colors.textInverse,
            fontFamily: typography.fontFamily.bold,
            fontSize: typography.fontSize.base,
          }}>
            Guardar cambios
          </Text>
        </TouchableOpacity>
      </View>

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
  avatarWrap: {
    width: 88, height: 88,
    backgroundColor: '#1A2744',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: -6, right: -6,
    width: 30, height: 30,
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
  signOutBtn: {
    padding: 13,
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    paddingHorizontal: 18,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
})