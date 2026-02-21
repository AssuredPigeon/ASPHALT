import { useTheme } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ALL_BADGES = [
  { id: 1, icon: 'navigate',    label: 'Explorador',   earned: true,  desc: 'Haz tu primer reporte de ruta'      },
  { id: 2, icon: 'search',      label: 'Investigador', earned: true,  desc: 'Confirma 5 reportes de otros'       },
  { id: 3, icon: 'star',        label: 'Destacado',    earned: true,  desc: 'Recibe 10 confirmaciones'            },
  { id: 4, icon: 'car',         label: 'Viajero Pro',  earned: false, desc: 'Registra 20 viajes'                  },
  { id: 5, icon: 'map',         label: 'Cartógrafo',   earned: false, desc: 'Reporta en 5 calles distintas'      },
  { id: 6, icon: 'trophy',      label: 'Leyenda',      earned: false, desc: 'Alcanza 100 puntos de contribución' },
]

export default function BadgesScreen() {
  const router = useRouter()
  const { theme } = useTheme()
  const { colors, typography, spacing, borderRadius } = theme
  const insets = useSafeAreaInsets()

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
              Todas las Insignias
            </Text>
            <View style={{ width: 38 }} />
          </View>

          {/* Contador */}
          <Text style={{
            color: colors.textSecondary,
            fontFamily: typography.fontFamily.regular,
            fontSize: typography.fontSize.sm,
            marginBottom: spacing[5],
          }}>
            {/* Devuelve un array con los que cumplen la condición: completadas*/}
            {ALL_BADGES.filter(b => b.earned).length} de {ALL_BADGES.length} desbloqueadas
          </Text>

          {/* Grid de insignias */}
          <View style={styles.grid}>
            {ALL_BADGES.map(badge => (
              <View
                key={badge.id}
                style={[styles.badgeCard, {
                  backgroundColor: badge.earned ? colors.primaryMuted ?? '#EEF3FF' : colors.backgroundSecondary,
                  borderColor:     badge.earned ? colors.primaryBorder  : colors.border,
                  borderRadius:    borderRadius.lg,
                  opacity:         badge.earned ? 1 : 0.55,
                }]}
              >
                <View style={[styles.iconWrap, {
                  backgroundColor: badge.earned ? colors.primary + '22' : 'rgba(0,0,0,0.06)',
                  borderRadius: 14,
                  marginBottom: spacing[2],
                }]}>
                  {badge.earned ? (
                    <Ionicons name={badge.icon as any} size={26} color={colors.primary} />
                  ) : (
                    <Ionicons name="lock-closed" size={22} color={colors.textTertiary ?? colors.textSecondary} />
                  )}
                </View>
                <Text style={{
                  color:      badge.earned ? colors.text : colors.textSecondary,
                  fontFamily: typography.fontFamily.semiBold,
                  fontSize:   typography.fontSize.xs,
                  textAlign:  'center',
                  marginBottom: 4,
                }}>
                  {badge.label}
                </Text>
                <Text style={{
                  color:      colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  fontSize:   9,
                  textAlign:  'center',
                  lineHeight: 13,
                }}>
                  {badge.desc}
                </Text>
              </View>
            ))}
          </View>

        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  row:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBtn: {
    width: 38, height: 38,
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: '30%',
    padding: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  iconWrap: {
    width: 52, height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
