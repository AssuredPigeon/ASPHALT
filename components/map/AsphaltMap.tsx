import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LocationObject } from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet } from 'react-native';
import MapView, { Region } from 'react-native-maps';

interface Props {
  location: LocationObject | null;
}

export default function AsphaltMap({ location }: Props) {
  const { theme, isDark } = useTheme();
  const styles = makeStyles(theme);

  const mapRef = useRef<MapView>(null);
  const lastLocationRef = useRef<LocationObject | null>(null);
  const [followUser, setFollowUser] = useState(true);

  // 🌞 Light style (solo Android lo usará)
  const lightMapStyle = [
    {
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#c9e6ff' }],
    },
  ];

  // 🌙 Dark elegante (solo Android)
  const darkMapStyle = [
    {
      elementType: 'geometry',
      stylers: [{ color: '#2b2b2b' }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#bdbdbd' }],
    },
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#3a3a3a' }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#1e3a5f' }],
    },
  ];

  // 📏 Distancia (Haversine)
  const getDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371000;
    const toRad = (v: number) => (v * Math.PI) / 180;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  // 🔍 Zoom dinámico
  const getRegion = (location: LocationObject): Region => {
    const speed = location.coords.speed ?? 0;

    const delta =
      speed > 25 ? 0.02 :
      speed > 15 ? 0.01 :
      0.005;

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
  };

  // 📍 Seguimiento optimizado
  useEffect(() => {
    if (!location || !followUser) return;

    const last = lastLocationRef.current;

    if (last) {
      const distance = getDistance(
        last.coords.latitude,
        last.coords.longitude,
        location.coords.latitude,
        location.coords.longitude
      );

      if (distance < 15) return;
    }

    lastLocationRef.current = location;
    mapRef.current?.animateToRegion(getRegion(location), 500);
  }, [location, followUser]);

  const goToUser = () => {
    if (!location) return;

    lastLocationRef.current = null;
    setFollowUser(true);

    mapRef.current?.animateToRegion(getRegion(location), 500);
  };

  const handleUserPan = () => {
    setFollowUser(false);
  };

  return (
    <>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        mapType={
          Platform.OS === 'ios'
            ? isDark
              ? 'mutedStandard'
              : 'standard'
            : 'standard'
        }
        {...(Platform.OS === 'android' && {
          customMapStyle: isDark ? darkMapStyle : lightMapStyle,
        })}
        showsUserLocation
        showsMyLocationButton={false}
        rotateEnabled
        pitchEnabled
        showsCompass
        compassOffset={{ x: 0, y: 150 }}
        onPanDrag={handleUserPan}
        followsUserLocation={false}
      />

      <Pressable
        onPress={goToUser}
        style={({ pressed }) => [
          styles.gpsButton,
          pressed && styles.gpsButtonPressed,
        ]}
      >
        <MaterialIcons
          name={followUser ? 'gps-fixed' : 'gps-not-fixed'}
          size={24}
          color={
            followUser
              ? theme.colors.primary
              : theme.colors.textSecondary
          }
        />
      </Pressable>
    </>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    gpsButton: {
      position: 'absolute',
      bottom: 250,
      right: theme.spacing.screenH,
      backgroundColor: theme.colors.surface,
      padding: theme.spacing[3.5],
      borderRadius: theme.borderRadius.full,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...theme.shadows.lg,
    },
    gpsButtonPressed: {
      backgroundColor: theme.colors.primaryMuted,
      borderColor: theme.colors.primaryBorder,
    },
  });
