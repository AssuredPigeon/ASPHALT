import type { Badge } from '@/types/badge'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, View } from 'react-native'
import { useTheme } from '../../theme'

type Props = { badges: Badge[] }

export default function BadgeGrid({ badges }: Props) {
  const { theme } = useTheme()
  const { borderRadius, colors } = theme

  return (
    <View style={styles.grid}>
      {/* Itera sobre badges y devuelve un badge */}
      {badges.map((badge) => (
        <View
          key={badge.id}
          style={[
            styles.badge,
            { borderRadius: borderRadius.md },
            badge.earned ? styles.badgeEarned : styles.badgeLocked,
          ]}
        >
          <Ionicons
            name={(badge.earned ? badge.icon : 'lock-closed') as any}
            size={20}
            color={badge.earned ? colors.primary : colors.textTertiary}
          />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    width: 46, height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeEarned: {
    backgroundColor: 'rgba(76,141,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(76,141,255,0.3)',
  },
  badgeLocked: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
})