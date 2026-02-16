import { useTheme } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  type: 'report' | 'trip'
  title: string
  subtitle: string
  right?: string
  status?: 'confirmado' | 'pendiente'
}

export default function HistoryCard({ type, title, subtitle, right, status }: Props) {
  const { theme } = useTheme()
  const { typography, borderRadius } = theme

  const dotColor = status === 'confirmado' ? '#4DFFA0' : '#FFB347'

  return (
    <View style={styles.row}>

      {type === 'trip' ? (
        <View style={[styles.tripIcon, { borderRadius: borderRadius.md }]}>
          <Text style={{ fontSize: 16 }}>🛣️</Text>
        </View>
      ) : (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      )}

      <View style={styles.content}>
        <Text style={[styles.title, { fontFamily: typography.fontFamily.semiBold }]}>
          {title}
        </Text>
        <Text style={[styles.subtitle, { fontFamily: typography.fontFamily.regular }]}>
          {subtitle}
        </Text>
      </View>

      {right && (
        status ? (
          <View style={[
            styles.statusBadge,
            { backgroundColor: status === 'confirmado'
                ? 'rgba(77,255,160,0.1)'
                : 'rgba(255,179,71,0.1)' }
          ]}>
            <Text style={[styles.statusText, {
              color: dotColor,
              fontFamily: typography.fontFamily.semiBold
            }]}>
              {status}
            </Text>
          </View>
        ) : (
          <Text style={[styles.rightText, { fontFamily: typography.fontFamily.semiBold }]}>
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
    backgroundColor: 'rgba(62,110,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(62,110,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  content: { flex: 1, gap: 2 },
  title: { color: '#fff', fontSize: 13 },
  subtitle: { color: 'rgba(255,255,255,0.3)', fontSize: 11 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10 },
  rightText: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
})