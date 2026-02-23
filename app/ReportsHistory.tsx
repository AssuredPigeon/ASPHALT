import { useTheme } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import HistoryCard from '../components/ui/HistoryCard'

const REPORTS = [
  { id: '1', street: 'Blvd. Agua Caliente', time: 'hace 2 horas',  status: 'confirmado'  },
  { id: '2', street: 'Av. Revolución',       time: 'ayer',          status: 'confirmado'  },
  { id: '3', street: 'Calle 5ta',            time: 'hace 3 días',   status: 'pendiente'   },
  { id: '4', street: 'Blvd. Díaz Ordaz',     time: 'hace 5 días',   status: 'confirmado' },
  { id: '5', street: 'Av. Tecnológico',      time: 'hace 1 semana', status: 'pendiente'   },
] as const

export default function ReportsHistoryScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { colors, typography, spacing, borderRadius } = theme
  const insets = useSafeAreaInsets()
  const { t } = useTranslation()

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
              {t('reports.title')}
            </Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Subtítulo */}
          <Text style={{
            color: colors.textSecondary,
            fontFamily: typography.fontFamily.regular,
            fontSize: typography.fontSize.sm,
            marginBottom: spacing[4],
          }}>
            {t('reports.total', { count: REPORTS.length })}
          </Text>

          {/* Lista completa */}
          <View style={[styles.cardContainer, {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
          }]}>
            {REPORTS.map((r, i) => (
              <View key={r.id} style={i < REPORTS.length - 1 ? styles.borderBottom : undefined}>
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
  cardContainer: { borderWidth: 1, overflow: 'hidden' },
  borderBottom:  { borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.06)' },
})