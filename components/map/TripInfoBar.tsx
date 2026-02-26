import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Distancia Haversine en metros */
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

/** Velocidad promedio urbana asumida para calcular ETA */
const AVG_SPEED_KMH = 40;

interface Props {
  destination:  { lat: number; lon: number; name: string };
  location:     Location.LocationObject | null;
  useImperial?: boolean; // TODO: conectar con AppSettingsContext
}

export default function TripInfoBar({ destination, location, useImperial = false }: Props) {
  const { theme } = useTheme();
  const styles    = makeStyles(theme);

  const [distText,     setDistText]     = useState('—');
  const [timeText,     setTimeText]     = useState('—');
  const [arrivalText,  setArrivalText]  = useState('—');

  useEffect(() => {
    if (!location) return;

    const { latitude: lat1, longitude: lon1 } = location.coords;
    const { lat: lat2, lon: lon2 }             = destination;

    const meters  = getDistanceMeters(lat1, lon1, lat2, lon2);
    const km      = meters / 1000;
    const minutes = Math.round((km / AVG_SPEED_KMH) * 60);

    // Distancia 
    if (useImperial) {
      const miles = km * 0.621371;
      setDistText(miles < 0.1 ? `${Math.round(meters * 3.281)} ft` : `${miles.toFixed(1)} mi`);
    } else {
      setDistText(km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`);
    }

    // Tiempo estimado 
    if (minutes < 1) {
      setTimeText('< 1 min');
    } else if (minutes < 60) {
      setTimeText(`${minutes} min`);
    } else {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      setTimeText(m > 0 ? `${h}h ${m}m` : `${h}h`);
    }

    // Hora estimada de llegada 
    const arrival = new Date(Date.now() + minutes * 60 * 1000);
    const hh      = arrival.getHours().toString().padStart(2, '0');
    const mm      = arrival.getMinutes().toString().padStart(2, '0');
    setArrivalText(`${hh}:${mm}`);

  }, [location, destination]);

  return (
    <View style={styles.bar}>

      {/* Distancia restante */}
      <View style={styles.item}>
        <Ionicons name="navigate-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.value}>{distText}</Text>
      </View>

      <View style={styles.separator} />

      {/* Tiempo estimado */}
      <View style={styles.item}>
        <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.value}>{timeText}</Text>
      </View>

      <View style={styles.separator} />

      {/* Hora de llegada */}
      <View style={styles.item}>
        <Ionicons name="flag-outline" size={14} color={theme.colors.textSecondary} />
        <Text style={styles.value}>{arrivalText}</Text>
      </View>

    </View>
  );
}

// Estilos
const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    bar: {
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-around',
      backgroundColor:   theme.colors.surface,
      borderRadius:      theme.borderRadius.lg,
      borderWidth:       1,
      borderColor:       theme.colors.border,
      paddingVertical:   theme.spacing[3],
      paddingHorizontal: theme.spacing[4],
      marginTop:         theme.spacing[2],
      ...theme.shadows.md,
    },
    item: {
      flex:           1,
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'center',
      gap:            theme.spacing[1.5],
    },
    value: {
      ...theme.typography.styles.label,
      color:      theme.colors.text,
      fontWeight: '600',
    },
    separator: {
      width:           1,
      height:          20,
      backgroundColor: theme.colors.divider,
    },
  });