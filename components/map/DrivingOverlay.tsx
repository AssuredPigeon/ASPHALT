import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

/** Distancia Haversine entre dos coordenadas (metros) */
function getDistanceMeters(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R  = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a  =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Rumbo (bearing) desde punto A hacia punto B en grados 0-360 */
function getBearing(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const y    = Math.sin(dLon) * Math.cos((lat2 * Math.PI) / 180);
  const x    =
    Math.cos((lat1 * Math.PI) / 180) * Math.sin((lat2 * Math.PI) / 180) -
    Math.sin((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Formatea metros : "50 m", "1.2 km", "1.2 mi" según unidad */
function formatDistance(meters: number, useImperial: boolean): string {
  if (useImperial) {
    const miles = meters / 1609.34;
    if (miles < 0.1) return `${Math.round(meters * 3.281)} ft`;
    return `${miles.toFixed(1)} mi`;
  }
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}


interface Props {
  destination:  { lat: number; lon: number; name: string };
  location:     Location.LocationObject | null;
  useImperial?: boolean; // TODO: conectar con AppSettingsContext cuando esté disponible
  onStop:       () => void;
}

export default function DrivingOverlay({
  destination,
  location,
  useImperial = false,
  onStop,
}: Props) {
  const { theme, isDark } = useTheme();
  const styles            = makeStyles(theme, isDark);
  const { t }             = useTranslation();

  // Bearing animado para suavizar la rotación de la flecha
  const arrowRotation = useSharedValue(0);
  const [distanceText, setDistanceText] = useState(t('driving.calculating'));
  const [streetName,   setStreetName]   = useState('');

  useEffect(() => {
    if (!location) return;

    const { latitude: lat1, longitude: lon1 } = location.coords;
    const { lat: lat2, lon: lon2 }             = destination;

    // Calcular distancia y rumbo
    const meters  = getDistanceMeters(lat1, lon1, lat2, lon2);
    const bearing = getBearing(lat1, lon1, lat2, lon2);

    setDistanceText(formatDistance(meters, useImperial));

    // Animar la rotación de la flecha suavemente
    arrowRotation.value = withTiming(bearing, { duration: 400 });

    // Obtener nombre de calle con Nominatim reverse geocoding
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat1}&lon=${lon1}&format=json`,
      {
        headers: {
          'User-Agent': 'AsphaltApp/1.0',
          'Accept':     'application/json',
        },
      }
    )
      .then(r => r.json())
      .then(data => {
        const road = data?.address?.road ?? data?.address?.pedestrian ?? '';
        setStreetName(road);
      })
      .catch(() => {});
  }, [location]);

  // Estilo animado para la rotación de la flecha
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${arrowRotation.value}deg` }],
  }));

  return (
    <>
      {/* Tarjeta de dirección (top-left) */}
      <View style={styles.navCard}>

        {/* Flecha de dirección animada */}
        <Animated.View style={[styles.arrowContainer, arrowStyle]}>
          <Ionicons name="arrow-up" size={36} color="#fff" />
        </Animated.View>

        {/* Distancia + calle */}
        <View style={styles.navInfo}>
          <Text style={styles.distanceText}>{distanceText}</Text>
          {streetName.length > 0 && (
            <Text style={styles.streetText} numberOfLines={1}>
              {streetName}
            </Text>
          )}
        </View>
      </View>

      {/*  Botón Detener (top-right)  */}
      <TouchableOpacity
        style={styles.stopBtn}
        onPress={onStop}
        activeOpacity={0.85}
      >
        <Ionicons name="stop" size={16} color="#fff" />
        <Text style={styles.stopText}>{t('driving.stop')}</Text>
      </TouchableOpacity>
    </>
  );
}


// Estilos
const makeStyles = (theme: AppTheme, isDark: boolean) => {
  const navBg = isDark ? 'rgba(15,28,58,0.95)' : 'rgba(20,40,80,0.92)';

  return StyleSheet.create({
    navCard: {
      position:      'absolute',
      top:           60,
      left:          theme.spacing.screenH,
      flexDirection: 'row',
      alignItems:    'center',
      gap:           theme.spacing[3],
      backgroundColor: navBg,
      borderRadius:    theme.borderRadius.lg,
      paddingVertical:   theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      zIndex:          theme.zIndex.sticky,
      maxWidth:        '50%',   // Más estrecho para que haya espacio visible entre ambos botones
      ...theme.shadows.xl,
    },
    arrowContainer: {
      width:          48,
      height:         48,
      alignItems:     'center',
      justifyContent: 'center',
    },
    navInfo: {
      flex: 1,
      gap:  2,
    },
    distanceText: {
      ...theme.typography.styles.h3,
      color:      '#fff',
      fontWeight: '700',
    },
    streetText: {
      ...theme.typography.styles.caption,
      color:   'rgba(255,255,255,0.7)',
      fontSize: 11,
    },
    stopBtn: {
      position:          'absolute',
      top:               64,   // 4px más bajo que navCard para alineación visual clara
      right:             theme.spacing.screenH,
      flexDirection:     'row',
      alignItems:        'center',
      gap:               theme.spacing[1.5],
      backgroundColor:   theme.colors.error,
      borderRadius:      theme.borderRadius.full,
      paddingVertical:   theme.spacing[2.5],
      paddingHorizontal: theme.spacing[4],
      zIndex:            theme.zIndex.sticky,
      ...theme.shadows.lg,
    },
    stopText: {
      ...theme.typography.styles.captionMedium,
      color:      '#fff',
      fontWeight: '600',
    },
  });
};