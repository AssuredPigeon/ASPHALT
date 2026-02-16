import { useTheme } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import BadgeGrid from '../components/ui/BadgeGrid'
import HistoryCard from '../components/ui/HistoryCard'

const BADGES = [
  { id: 1, icon: 'road',        earned: true  },
  { id: 2, icon: 'search',      earned: true  },
  { id: 3, icon: 'star',        earned: true  },
  { id: 4, icon: 'lock-closed', earned: false },
  { id: 5, icon: 'lock-closed', earned: false },
  { id: 6, icon: 'lock-closed', earned: false },
]

const REPORTS = [
  { id: '1', street: 'Blvd. Agua Caliente', time: 'hace 2 horas', status: 'confirmado' as const },
  { id: '2', street: 'Av. Revolución',       time: 'ayer',         status: 'confirmado' as const },
  { id: '3', street: 'Calle 5ta',            time: 'hace 3 días',  status: 'pendiente'  as const },
]

const TRIPS = [
  { id: '1', route: 'Casa → Trabajo',          date: 'Hoy, 7:42 AM',  km: '12.4 km' },
  { id: '2', route: 'Plaza Río → Mesa de Otay', date: 'Ayer, 6:15 PM', km: '8.7 km'  },
]

export default function ProfileScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { colors, typography, spacing, borderRadius } = theme
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.container, {
      backgroundColor: colors.background,
      paddingTop: insets.top,
    }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 90 }}
      >
        <View style={{ paddingHorizontal: spacing.screenH, paddingTop: 16 }}>

          {/* HEADER */}
          <View style={[styles.row, { marginBottom: spacing[7] }]}>

            {/* ← Botón retroceder */}
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
              fontFamily: typography.fontFamily.extraBold,
              fontSize: typography.fontSize.xl,
            }}>
              Mi Perfil
            </Text>

            {/* Editar perfil */}
            <TouchableOpacity
              onPress={() => router.navigate('/EditProfile' as any)}
              style={[styles.ghostBtn, {
                borderRadius: borderRadius.button,
                borderColor: colors.border,
              }]}
              activeOpacity={0.7}
            >
              <Ionicons name="pencil-outline" size={14} color={colors.textSecondary} />
              <Text style={{
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.medium,
                fontSize: typography.fontSize.sm,
              }}>
                Editar
              </Text>
            </TouchableOpacity>
          </View>

          {/* AVATAR */}
          <View style={[styles.centered, { marginBottom: spacing[8] }]}>
            <View style={[styles.avatar, {
              borderRadius: borderRadius.xl,
              borderColor: colors.primaryBorder,
              marginBottom: spacing[3],
            }]}>
              <Ionicons name="person" size={36} color={colors.primary} />
            </View>
            <Text style={{
              color: colors.text,
              fontFamily: typography.fontFamily.extraBold,
              fontSize: typography.fontSize['2xl'],
              marginBottom: spacing[1],
            }}>
              Viajero #1
            </Text>
            <Text style={{
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
              fontSize: typography.fontSize.sm,
            }}>
              usuario@correo.com
            </Text>
          </View>

          {/* INSIGNIAS */}
          <View style={{ marginBottom: spacing[5] }}>
            <View style={[styles.row, { marginBottom: spacing[2] }]}>
              <Text style={{
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
                fontSize: typography.fontSize.md,
              }}>
                Insignias desbloqueadas
              </Text>
              <TouchableOpacity>
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
            <BadgeGrid badges={BADGES} />
          </View>

          {/* DIVIDER */}
          <View style={[styles.divider, {
            backgroundColor: colors.divider,
            marginVertical: spacing[5],
          }]} />

          {/* REPORTES */}
          <View style={{ marginBottom: spacing[5] }}>
            <Text style={{
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.md,
              marginBottom: spacing[1],
            }}>
              Historial de Reportes
            </Text>
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
              {REPORTS.map((r, i) => (
                <View key={r.id}
                  style={i < REPORTS.length - 1 ? styles.borderBottom : undefined}
                >
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

          {/* DIVIDER */}
          <View style={[styles.divider, {
            backgroundColor: colors.divider,
            marginVertical: spacing[5],
          }]} />

          {/* VIAJES */}
          <View>
            <Text style={{
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.md,
              marginBottom: spacing[1],
            }}>
              Historial de Viajes
            </Text>
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
              {TRIPS.map((t, i) => (
                <View key={t.id}
                  style={i < TRIPS.length - 1 ? styles.borderBottom : undefined}
                >
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
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
  },
  avatar: {
    width: 80, height: 80,
    backgroundColor: '#1A2744',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1 },
  cardContainer: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
})