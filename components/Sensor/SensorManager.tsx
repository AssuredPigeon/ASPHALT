import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AcousticSensor } from './AcousticSensor';
import { SensorModule } from './SensorModule';

// Le decimos que va a recibir la ubicación y el estado del modo conducción
interface SensorManagerProps {
  location:           Location.LocationObject | null;
  isDriving:          boolean;                  // Controla si está en modo conducción
  onInitiateDriving:  () => void;               // Abre el modal de destino
}

export function SensorManager({ location, isDriving, onInitiateDriving }: SensorManagerProps) {
  const { theme } = useTheme();
  const styles    = makeStyles(theme);
  const { t }     = useTranslation();

  // Estado del toggle acústico manual — se sincroniza automáticamente si isDriving cambia
  const [drivingMode, setDrivingMode] = useState(false);

  // Cuando el modo conducción global se activa, forzamos el drivingMode del panel también
  useEffect(() => {
    if (isDriving) setDrivingMode(true);
  }, [isDriving]);

  //  Pantalla de inicio: botón grande para iniciar modo conducción 
  if (!isDriving) {
    return (
      <View style={styles.wrapper}>
        <TouchableOpacity
          style={styles.initBtn}
          onPress={onInitiateDriving}
          activeOpacity={0.85}
        >
          <Ionicons name="navigate" size={22} color="#fff" />
          <Text style={styles.initBtnText}>{t('driving.initButton')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  //  Modo conducción activo: panel completo de sensores 
  return (
    <View style={styles.wrapper}>

      {/* Tarjeta que agrupa ambos sensores */}
      <View style={styles.card}>

        {/* Fila superior: solo título del panel — el badge se eliminó por diseño */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('driving.sensorsTitle')}</Text>
        </View>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* Le pasamos la ubicación a tu sensor para que calcule la velocidad */}
        <SensorModule location={location} />

        {/* El sensor acústico se activa automáticamente con el modo conducción */}
        <AcousticSensor drivingMode={drivingMode} />

      </View>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      // No position absolute aquí — el padre (index.tsx overlay) ya lo posiciona
    },

    //  Botón de inicio 
    initBtn: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'center',
      gap:               theme.spacing[2.5],
      backgroundColor:   theme.colors.primary,
      borderRadius:      theme.borderRadius.lg,
      paddingVertical:   theme.spacing[4],
      paddingHorizontal: theme.spacing[6],
      ...theme.shadows.lg,
    },
    initBtnText: {
      ...theme.typography.styles.label,
      color:      '#fff',
      fontWeight: '700',
      fontSize:   16,
    },

    //  Panel de sensores (igual al diseño original) 
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius:    theme.borderRadius.lg,
      borderWidth:     1,
      borderColor:     theme.colors.border,
      padding:         theme.spacing[3],
      gap:             theme.spacing[2],
      ...theme.shadows.md,
    },
    header: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      ...theme.typography.styles.label,
      color: theme.colors.textSecondary,
    },

    // Badge "Conduciendo" — siempre activo (no es toggleable en este estado)
    drivingBadge: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               theme.spacing[1.5],
      paddingVertical:   theme.spacing[1.5],
      paddingHorizontal: theme.spacing[3],
      borderRadius:      theme.borderRadius.full,
      borderWidth:       1,
      borderColor:       theme.colors.error,
      backgroundColor:   theme.colors.errorMuted,
    },
    drivingDot: {
      width:           7,
      height:          7,
      borderRadius:    4,
      backgroundColor: theme.colors.error, // Punto rojo pulsando
    },
    drivingBadgeText: {
      ...theme.typography.styles.captionMedium,
      color:      theme.colors.error,
      fontWeight: '600',
    },

    divider: {
      height:          1,
      backgroundColor: theme.colors.divider,
    },
  });