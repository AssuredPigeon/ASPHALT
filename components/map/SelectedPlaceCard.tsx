import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  name:           string;
  lat:            number;
  lon:            number;
  onClose:        () => void;
  onStartDriving: (lat: number, lon: number, name: string) => void;
}

export default function SelectedPlaceCard({
  name,
  lat,
  lon,
  onClose,
  onStartDriving,
}: Props) {
  const { theme } = useTheme();
  const styles    = makeStyles(theme);
  const { t }     = useTranslation();

  return (
    <View style={styles.card}>

      {/* Fila superior: nombre del lugar + botón cerrar */}
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Ionicons name="location" size={18} color={theme.colors.primary} />
        </View>

        <Text style={styles.placeName} numberOfLines={2}>
          {name}
        </Text>

        <Pressable
          onPress={onClose}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
        >
          <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
        </Pressable>
      </View>

      {/* Botón "Cómo llegar" */}
      <TouchableOpacity
        style={styles.dirBtn}
        onPress={() => onStartDriving(lat, lon, name)}
        activeOpacity={0.85}
      >
        <Ionicons name="navigate" size={16} color="#fff" />
        <Text style={styles.dirBtnText}>{t('driving.howToGet')}</Text>
      </TouchableOpacity>

    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      backgroundColor:   theme.colors.surface,
      borderRadius:      theme.borderRadius.lg,
      borderWidth:       1,
      borderColor:       theme.colors.border,
      padding:           theme.spacing[4],
      gap:               theme.spacing[3],
      ...theme.shadows.xl,
    },
    header: {
      flexDirection: 'row',
      alignItems:    'flex-start',
      gap:           theme.spacing[2.5],
    },
    iconWrap: {
      width:           36,
      height:          36,
      borderRadius:    18,
      backgroundColor: theme.colors.primaryMuted,
      alignItems:      'center',
      justifyContent:  'center',
      flexShrink:      0,
    },
    placeName: {
      flex:       1,
      ...theme.typography.styles.label,
      color:      theme.colors.text,
      fontWeight: '600',
    },
    dirBtn: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'center',
      gap:               theme.spacing[2],
      backgroundColor:   theme.colors.primary,
      borderRadius:      theme.borderRadius.full,
      paddingVertical:   theme.spacing[2.5],
      paddingHorizontal: theme.spacing[5],
      alignSelf:         'flex-start',
    },
    dirBtnText: {
      ...theme.typography.styles.captionMedium,
      color:      '#fff',
      fontWeight: '600',
    },
  });