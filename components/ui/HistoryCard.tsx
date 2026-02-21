import { useTheme } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';

// Solo puede ser 1 o 2
type Props = {
  type: 'report' | 'trip'
  title: string
  subtitle: string
  right?: string
  status?: 'confirmado' | 'pendiente'
}

export default function HistoryCard({ type, title, subtitle, right, status }: Props) {
  const { theme } = useTheme()
  const { colors, typography, borderRadius } = theme

  const dotColor = status === 'confirmado' ? '#22C55E' : '#F59E0B'

  return (
    <View style={styles.row}>

      {type === 'trip' ? (
        <View style={[styles.tripIcon, {
          borderRadius: borderRadius.md,
          backgroundColor: colors.primaryMuted,
          borderColor:     colors.primaryBorder,
        }]}>
          <Text style={{ fontSize: 16 }}>🛣️</Text>
        </View>
      ) : (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      )}

      <View style={styles.content}>
        <Text style={[styles.title, {
          color:      colors.text,
          fontFamily: typography.fontFamily.semiBold,
        }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, {
          color:      colors.textSecondary,
          fontFamily: typography.fontFamily.regular,
        }]}>
          {subtitle}
        </Text>
      </View>

      {right && ( // condicional; T: Renderiza o F: Nada
        status ? ( // Si existe: Renderiza, sino, nada
          <View style={[styles.statusBadge, {
            backgroundColor: status === 'confirmado'
            // nullish coalescing operator: si existe, se usa y respeta, si no, usa el fallback
              ? colors.successMuted  ?? 'rgba(34,197,94,0.12)'
              : colors.warningMuted  ?? 'rgba(245,158,11,0.12)',
          }]}>
            <Text style={[styles.statusText, {
              color:      dotColor,
              fontFamily: typography.fontFamily.semiBold,
            }]}>
              {status}
            </Text>
          </View>
        ) : (
          <Text style={[styles.rightText, {
            color:      colors.textSecondary,
            fontFamily: typography.fontFamily.semiBold,
          }]}>
            {right}
          </Text>
        )
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 16,
    gap: 12,
  },
  dot: {
    width: 8, height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  tripIcon: {
    width: 36, height: 36,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content:     { flex: 1, gap: 2 },
  title:       { fontSize: 13 },
  subtitle:    { fontSize: 11 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText:  { fontSize: 10 },
  rightText:   { fontSize: 12 },
})