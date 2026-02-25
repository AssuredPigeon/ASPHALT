import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AcousticSensor } from './AcousticSensor';
import { SensorModule } from './SensorModule';

// Le decimos que va a recibir la ubicación
interface SensorManagerProps {
  location: Location.LocationObject | null;
}

export function SensorManager({ location }: SensorManagerProps) {
  const { theme } = useTheme();
  const styles    = makeStyles(theme);

  // Estado del modo conducción — controla todo el panel de sensores
  const [drivingMode, setDrivingMode] = useState(false);

  return (
    // Contenedor flotante pegado al fondo de la pantalla, encima del mapa
    <View style={styles.wrapper}>

      {/* Tarjeta que agrupa ambos sensores */}
      <View style={styles.card}>

        {/* Fila superior: título del panel + botón modo conducción */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Sensores</Text>
          <TouchableOpacity
            style={[styles.drivingBtn, drivingMode && styles.drivingBtnActive]}
            onPress={() => setDrivingMode(prev => !prev)}
          >
            {/* El punto pulsa en rojo cuando está activo */}
            <View style={[styles.drivingDot, drivingMode && styles.drivingDotActive]} />
            <Text style={[styles.drivingText, drivingMode && styles.drivingTextActive]}>
              {drivingMode ? 'Conduciendo' : 'Modo Conducción'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Divisor */}
        <View style={styles.divider} />

        {/* Le pasamos la ubicación a tu sensor para que calcule la velocidad */}
        <SensorModule location={location} />

        {/* El sensor acústico recibe drivingMode para activarse automáticamente */}
        <AcousticSensor drivingMode={drivingMode} />

      </View>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    wrapper: {
      position: 'absolute',   // Flota sobre el mapa sin ocupar espacio del layout
      bottom:   20,
      left:     12,
      right:    12,
    },
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
    drivingBtn: {
      flexDirection:   'row',
      alignItems:      'center',
      gap:             theme.spacing[1.5],
      paddingVertical:   theme.spacing[1.5],
      paddingHorizontal: theme.spacing[3],
      borderRadius:    theme.borderRadius.full,
      borderWidth:     1,
      borderColor:     theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    drivingBtnActive: {
      // Cuando está activo, el botón se tiñe con el color de error (rojo suave)
      backgroundColor: theme.colors.errorMuted,
      borderColor:     theme.colors.error,
    },
    drivingDot: {
      width:           7,
      height:          7,
      borderRadius:    4,
      backgroundColor: theme.colors.textSecondary,
    },
    drivingDotActive: {
      backgroundColor: theme.colors.error, // Punto rojo cuando conduce
    },
    drivingText: {
      ...theme.typography.styles.captionMedium,
      color: theme.colors.textSecondary,
    },
    drivingTextActive: {
      color:      theme.colors.error,
      fontWeight: '600',
    },
    divider: {
      height:          1,
      backgroundColor: theme.colors.divider,
    },
  });