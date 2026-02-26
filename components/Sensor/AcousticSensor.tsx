import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface AcousticSensorProps {
  drivingMode: boolean; // Cuando es true, el sensor arranca automáticamente
}

// Clasifica el tipo de superficie según el nivel de dB captado
// Mientras más ruido de rodadura, más rugoso es el pavimento
type SurfaceKey = 'no_signal' | 'smooth_pavement' | 'regular_asphalt' | 'rough_surface' | 'uneven_terrain';

function classifySurface(db: number): SurfaceKey {
  if (db <= -80) return 'no_signal';
  if (db <= -55) return 'smooth_pavement';
  if (db <= -35) return 'regular_asphalt';
  if (db <= -20) return 'rough_surface';
  return 'uneven_terrain';
}

// Color del punto según la superficie detectada
const getDotColor = (surface: SurfaceKey, theme: AppTheme): string => {
  switch (surface) {
    case 'smooth_pavement': return theme.colors.success;
    case 'regular_asphalt': return theme.colors.primary;
    case 'rough_surface':   return theme.colors.warning;
    case 'uneven_terrain':  return theme.colors.error;
    default:                return theme.colors.textSecondary;
  }
};

export function AcousticSensor({ drivingMode }: AcousticSensorProps) {
  const { theme } = useTheme();
  const styles    = makeStyles(theme);
  const { t }     = useTranslation();

  const [recording, setRecording]               = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [metering, setMetering]                 = useState<number>(-160);
  const [isProcessing, setIsProcessing]         = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        // Un catch silencioso por si la app se cierra de golpe
        recording.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, [recording]);

  // Cuando el modo conducción se activa/desactiva, arranca o detiene el sensor
  useEffect(() => {
    if (drivingMode) {
      startRecording();
    } else {
      stopRecording();
    }
  }, [drivingMode]);

  async function startRecording() {
    if (isProcessing || recording) return;
    setIsProcessing(true);
    try {
      if (permissionResponse?.status !== 'granted') {
        await requestPermission();
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording && status.metering) setMetering(status.metering);
        },
        100
      );
      setRecording(newRecording);
    } catch (err) {
      console.error('Fallo al iniciar la grabacion', err);
    } finally {
      setIsProcessing(false);
    }
  }

  async function stopRecording() {
    if (!recording || isProcessing) return;
    setIsProcessing(true);
    try {
      const currentRecording = recording; // Guardamos la referencia
      setRecording(null);                 // Actualizamos la UI inmediatamente
      await currentRecording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    } catch (error) {
      console.log('Ignorado: El sensor ya estaba detenido', error);
    } finally {
      setIsProcessing(false);
      setMetering(-160); // Regresamos el medidor a cero (silencio)
    }
  }

  const surface  = classifySurface(metering);
  const dotColor = getDotColor(surface, theme);

  return (
    // Todo en una sola fila horizontal para ocupar el mínimo espacio posible
    <View style={styles.container}>

      {/* Punto de color según la superficie detectada */}
      <View style={[styles.dot, { backgroundColor: dotColor }]} />

      {/* Etiqueta fija */}
      <Text style={styles.title}>{t('acoustic.title')}</Text>

      {/* Separador visual */}
      <View style={styles.divider} />

      {/* Tipo de superficie detectado — ocupa el espacio sobrante */}
      <Text style={[styles.surface, { color: dotColor }]} numberOfLines={1}>
        {t(`acoustic.${surface}`)}
      </Text>

      {/* Valor dB en el extremo derecho */}
      {isProcessing ? (
        <ActivityIndicator size="small" color={theme.colors.primary} />
      ) : (
        <Text style={styles.dbText}>{metering.toFixed(1)} dB</Text>
      )}

    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection:     'row',
      alignItems:        'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical:   theme.spacing[3.5],
      backgroundColor:   theme.colors.surface,
      borderRadius:      theme.borderRadius.md,
      borderWidth:       1,
      borderColor:       theme.colors.border,
      gap:               theme.spacing[3],
      ...theme.shadows.sm,
    },
    dot: {
      width:        10,
      height:       10,
      borderRadius: 5,
    },
    title: {
      ...theme.typography.styles.label,
      color: theme.colors.textSecondary,
    },
    divider: {
      width:           1,
      height:          14,
      backgroundColor: theme.colors.divider,
    },
    surface: {
      flex: 1,   // Ocupa el espacio sobrante entre el separador y el dB
      ...theme.typography.styles.label,
      fontWeight: '600',
    },
    dbText: {
      ...theme.typography.styles.captionMedium,
      color:       theme.colors.textSecondary,
      fontVariant: ['tabular-nums'],
    },
  });