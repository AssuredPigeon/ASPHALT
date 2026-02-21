import { useTheme } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import HistoryCard from '../components/ui/HistoryCard'

const TRIPS = [
  { id: '1', route: 'Casa → Trabajo',           date: 'Hoy, 7:42 AM',    km: '12.4 km' },
  { id: '2', route: 'Plaza Río → Mesa de Otay', date: 'Ayer, 6:15 PM',   km: '8.7 km'  },
  { id: '3', route: 'Trabajo → Casa',            date: 'Ayer, 5:00 PM',   km: '12.1 km' },
  { id: '4', route: 'Centro → Playas',           date: 'Hace 2 días',     km: '18.3 km' },
  { id: '5', route: 'Garita → Centro',           date: 'Hace 3 días',     km: '9.5 km'  },
]

export default function TripsHistoryScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { colors, typography, spacing, borderRadius } = theme
  const insets = useSafeAreaInsets()

  // acum, elemento: Suma cada uno, lo vuelve string y lo reduce a una cifra decima
  const totalKm = TRIPS.reduce((acc, t) => acc + parseFloat(t.km), 0).toFixed(1)

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
            <Text style={{
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
              fontSize: typography.fontSize.lg,
            }}>
              Historial de Viajes
            </Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Resumen total */}
          <View style={[styles.summaryCard, {
            backgroundColor: colors.primaryMuted ?? '#EEF3FF',
            borderColor: colors.primaryBorder,
            borderRadius: borderRadius.lg,
            marginBottom: spacing[5],
          }]}>
            <View style={styles.summaryItem}>
              <Text style={{
                color: colors.primary,
                fontFamily: typography.fontFamily.extraBold,
                fontSize: typography.fontSize['2xl'],
              }}>
                {TRIPS.length}
              </Text>
              <Text style={{
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.xs,
              }}>
                viajes
              </Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.primaryBorder }]} />
            <View style={styles.summaryItem}>
              <Text style={{
                color: colors.primary,
                fontFamily: typography.fontFamily.extraBold,
                fontSize: typography.fontSize['2xl'],
              }}>
                {totalKm}
              </Text>
              <Text style={{
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
                fontSize: typography.fontSize.xs,
              }}>
                km totales
              </Text>
            </View>
          </View>

          {/* Lista completa */}
          <View style={[styles.cardContainer, {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
          }]}>
            {TRIPS.map((t, i) => (
              // agregar borde menos al último
              <View key={t.id} style={i < TRIPS.length - 1 ? styles.borderBottom : undefined}>
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
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  row:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: {
    width: 38, height: 38,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem:    { alignItems: 'center', flex: 1 },
  summaryDivider: { width: 1, height: 36 },
  cardContainer:  { borderWidth: 1, overflow: 'hidden' },
  borderBottom:   { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
})
