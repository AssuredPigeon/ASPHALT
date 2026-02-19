import { useTheme } from '@/theme'
import type { Badge } from '@/types/badge'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BadgeGrid from '../components/ui/BadgeGrid'
import HistoryCard from '../components/ui/HistoryCard'

// badges estaticas
const ALL_BADGES: Badge[] = [
  { id: 1, icon: 'navigate', earned: true },
  { id: 2, icon: 'search', earned: true },
  { id: 3, icon: 'star', earned: true },
  { id: 4, icon: 'lock-closed', earned: false },
  { id: 5, icon: 'lock-closed', earned: false },
  { id: 6, icon: 'lock-closed', earned: false },
]


// En perfil SOLO mostramos las ganadas
const EARNED_BADGES = ALL_BADGES.filter(b => b.earned)

// as const: literal exacto, permite un tipo estrictamente controlado
const REPORTS = [
  { id: '1', street: 'Blvd. Agua Caliente', time: 'hace 2 horas', status: 'confirmado' as const },
  { id: '2', street: 'Av. Revolución',       time: 'ayer',         status: 'confirmado' as const },
  { id: '3', street: 'Calle 5ta',            time: 'hace 3 días',  status: 'pendiente'  as const },
]

const TRIPS = [
  { id: '1', route: 'Casa → Trabajo',           date: 'Hoy, 7:42 AM',  km: '12.4 km' },
  { id: '2', route: 'Plaza Río → Mesa de Otay', date: 'Ayer, 6:15 PM', km: '8.7 km'  },
]

// Items visibles en el resumen antes del "Ver más"
const REPORTS_PREVIEW = 2
const TRIPS_PREVIEW   = 1

export default function ProfileScreen() {
  const router = useRouter() // navegación
  const { theme } = useTheme()
  const { colors, typography, spacing, borderRadius } = theme
  const insets = useSafeAreaInsets() // El posicionamiento de capa

  // permite copia superficial
  const previewReports = REPORTS.slice(0, REPORTS_PREVIEW)
  const previewTrips   = TRIPS.slice(0, TRIPS_PREVIEW)

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        <View style={{ paddingHorizontal: spacing.screenH, paddingTop: 16 }}>

          {/* HEADER */}
          <View style={[styles.row, { marginBottom: spacing[7] }]}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.iconBtn, { borderRadius: borderRadius.button, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { borderRadius: borderRadius.button, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
            </TouchableOpacity>
          </View>

          {/* AVATAR + NOMBRE + EDITAR */}
          <View style={[styles.centered, { marginBottom: spacing[8] }]}>
            <View style={[styles.avatar, { borderColor: colors.primaryBorder, marginBottom: spacing[3] }]}>
              <Ionicons name="person" size={40} color={colors.primary} />
            </View>
            <Text style={{
              color: colors.text,
              fontFamily: typography.fontFamily.extraBold,
              fontSize: typography.fontSize['2xl'],
              marginBottom: 2,
            }}>
              Viajero #1
            </Text>
            <Text style={{
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.sm,
              marginBottom: spacing[4],
            }}>
              Se unió hace # días
            </Text>
            <TouchableOpacity
              onPress={() => router.navigate('/EditProfile' as any)}
              style={[styles.editBtn, { borderRadius: borderRadius.button, borderColor: colors.border }]}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
              <Text style={{
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.medium,
                fontSize: typography.fontSize.sm,
              }}>
                Editar perfil
              </Text>
            </TouchableOpacity>
          </View>

          {/* INSIGNIAS (solo ganadas) */}
          <View style={{ marginBottom: spacing[5] }}>
            <View style={[styles.row, { marginBottom: spacing[2] }]}>
              <Text style={{
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.md,
              }}>
                Insignias desbloqueadas
              </Text>
              {/* Ver TODAS incluyendo bloqueadas */}
              <TouchableOpacity onPress={() => router.navigate('/Badges' as any)}>
                <Text style={{
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.sm,
                }}>
                  Ver Todas
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.xs,
              marginBottom: spacing[3],
            }}>
              Gana insignias por ayudar a otros conductores
            </Text>
            {/* Solo muestra badges ganadas, sin candados */}
            <BadgeGrid badges={EARNED_BADGES} />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider, marginVertical: spacing[5] }]} />

          {/* HISTORIAL DE REPORTES */}
          <View style={{ marginBottom: spacing[5] }}>
            <View style={[styles.row, { marginBottom: spacing[1] }]}>
              <Text style={{
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.md,
              }}>
                Historial de Reportes
              </Text>
              <TouchableOpacity onPress={() => router.navigate('/ReportsHistory' as any)}>
                <Text style={{
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.sm,
                }}>
                  Ver más
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.xs,
              marginBottom: spacing[3],
            }}>
              Último reporte
            </Text>
            <View style={[styles.cardContainer, {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              borderRadius: borderRadius.lg,
            }]}>
              {previewReports.map((r, i) => (
                <View key={r.id} style={i < previewReports.length - 1 ? styles.borderBottom : undefined}>
                  <HistoryCard
                    type="report"
                    title={r.street}
                    subtitle={r.time}
                    right={r.status}
                    status={r.status}
                  />
                </View>
              ))}
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider, marginVertical: spacing[5] }]} />

          {/* HISTORIAL DE VIAJES */}
          <View style={{ marginBottom: spacing[7] }}>
            <View style={[styles.row, { marginBottom: spacing[1] }]}>
              <Text style={{
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.md,
              }}>
                Historial de Viajes
              </Text>
              <TouchableOpacity onPress={() => router.navigate('/TripsHistory')}>
                <Text style={{
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.medium,
                  fontSize: typography.fontSize.sm,
                }}>
                  Ver más
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.xs,
              marginBottom: spacing[3],
            }}>
              Último viaje
            </Text>
            <View style={[styles.cardContainer, {
              backgroundColor: colors.backgroundSecondary,
              borderColor: colors.border,
              borderRadius: borderRadius.lg,
            }]}>
              {previewTrips.map((t, i) => (
                <View key={t.id} style={i < previewTrips.length - 1 ? styles.borderBottom : undefined}>
                  <HistoryCard
                    type="trip"
                    title={t.route}
                    subtitle={t.date}
                    right={t.km}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* CERRAR SESIÓN */}
          <TouchableOpacity
            style={[styles.signOutBtn, { borderRadius: borderRadius.button, backgroundColor: colors.error ?? '#E53E3E' }]}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={{ color: '#fff', fontFamily: typography.fontFamily.bold, fontSize: typography.fontSize.base }}>
              Cerrar Sesión
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  row:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  centered:      { alignItems: 'center' },
  iconBtn: {
    width: 38, height: 38,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 88, height: 88,
    borderRadius: 44,
    backgroundColor: '#E8EEF8',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 9,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
  },
  divider:       { height: 1 },
  cardContainer: { borderWidth: 1, overflow: 'hidden' },
  borderBottom:  { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
  signOutBtn: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 8,
  },
})