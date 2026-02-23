import { useTheme } from '@/theme'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// label y desc son KEYS de traducción, no strings directos
const ALL_BADGES = [
  { id: 1, icon: 'navigate', key: 'explorer',     earned: true  },
  { id: 2, icon: 'search',   key: 'researcher',   earned: true  },
  { id: 3, icon: 'star',     key: 'featured',     earned: true  },
  { id: 4, icon: 'car',      key: 'travelerPro',  earned: false },
  { id: 5, icon: 'map',      key: 'cartographer', earned: false },
  { id: 6, icon: 'trophy',   key: 'legend',       earned: false },
]

export default function BadgesScreen() {
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
              {t('badges.title')}
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
            {ALL_BADGES.filter(b => b.earned).length} de {ALL_BADGES.length} {t('badges.unlocked')}
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

                {/* Se traduce al renderizar usando la key del array */}
                <Text style={{
                  color:      badge.earned ? colors.text : colors.textSecondary,
                  fontFamily: typography.fontFamily.semiBold,
                  fontSize:   typography.fontSize.xs,
                  textAlign:  'center',
                  marginBottom: 4,
                }}>
                  {t(`badgesList.${badge.key}.label`)}
                </Text>
                <Text style={{
                  color:      colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                  fontSize:   9,
                  textAlign:  'center',
                  lineHeight: 13,
                }}>
                  {t(`badgesList.${badge.key}.desc`)}
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