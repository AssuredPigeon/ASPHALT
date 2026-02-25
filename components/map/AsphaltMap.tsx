import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LocationObject } from 'expo-location';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';

import StreetQualityLayer, { CalleEstado } from './StreetQualityLayer';

export type AsphaltMapHandle = {
  navigateTo: (lat: number, lon: number) => void;
};

interface Props {
  location: LocationObject | null;
}

// Calles mock con sus índices de calidad 
// Las coords NO están aquí — se obtienen de Overpass al activar el heatmap.
// Cuando se conecté a la BD, reemplaza esto con los datos reales.

const MOCK_QUALITY: Record<string, { id: number; indice: string }> = {
  'Avenida Mutualismo':           { id: 1,  indice: '12.00' },
  'Calle Coahuila':               { id: 2,  indice: '20.00' },
  'Calle Artículo 123':           { id: 3,  indice: '38.00' },
  'Calle Felipe Carrillo Puerto': { id: 4,  indice: '55.00' },
  'Calle Salvador Díaz Mirón':    { id: 5,  indice: '68.00' },
  'Avenida Flores Magón':         { id: 6,  indice: '82.00' },
  'Blvd. Agua Caliente':          { id: 7,  indice: '44.00' },
  'Paseo de los Héroes':          { id: 8,  indice: '90.00' },
  'Avenida Revolución':           { id: 9,  indice: '30.00' },
  'Calle Segunda':                { id: 10, indice: '16.00' },
  'Calle Tercera':                { id: 11, indice: '72.00' },
  'Avenida Constitución':         { id: 12, indice: '25.00' },
};

// Overpass API

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Evita errores con nombres, tildes, etc
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\b(avenida|boulevard|calzada|privada|paseo|calle|blvd|av|cal|priv)\b\.?/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchStreetsInRegion(region: Region): Promise<CalleEstado[]> {
  // Bounding box, el zoom (aprox 400m)
  const pad   = 0.004;
  const south = region.latitude  - region.latitudeDelta  / 2 - pad;
  const north = region.latitude  + region.latitudeDelta  / 2 + pad;
  const west  = region.longitude - region.longitudeDelta / 2 - pad;
  const east  = region.longitude + region.longitudeDelta / 2 + pad;

  // Consulta la API de Overpass
  const query = `
    [out:json][timeout:20];
    (
      way["highway"~"^(primary|secondary|tertiary|residential|unclassified|trunk)$"]
         ["name"]
         (${south},${west},${north},${east});
    );
    out geom;
  `.trim();

  const res  = await fetch(OVERPASS_URL, {
    method:  'POST',
    body:    `data=${encodeURIComponent(query)}`,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  if (!res.ok) throw new Error(`Overpass ${res.status}`);

  const json    = await res.json();
  const result: CalleEstado[] = [];

  // Mapa normalizado de los nombres que tenemos con calidad asignada
  const qualityNorm = new Map(
    Object.entries(MOCK_QUALITY).map(([name, data]) => [normalizeName(name), { name, ...data }])
  );

  for (const el of json.elements) {
    if (el.type !== 'way' || !el.geometry || !el.tags?.name) continue;

    const osmNorm = normalizeName(el.tags.name);

    // Match exacto o parcial
    let match = qualityNorm.get(osmNorm);
    if (!match) {
      for (const [key, val] of qualityNorm.entries()) {
        if (osmNorm.includes(key) || key.includes(osmNorm)) {
          match = val;
          break;
        }
      }
    }

    if (!match) continue;

    result.push({
      id_calle:            match.id,
      calle_nombre:        el.tags.name,
      indice_calidad:      match.indice,
      fecha_actualizacion: new Date().toISOString(),
      coordinates:         el.geometry.map((g: { lat: number; lon: number }) => ({
        lat: g.lat,
        lng: g.lon,
      })),
    });
  }

  return result;
}

// Leyenda 

const LEYENDA = [
  { color: 'rgba(50,  220, 90,  0.85)', label: 'Bueno (76–100)'  },
  { color: 'rgba(245, 205, 30,  0.85)', label: 'Regular (51–75)' },
  { color: 'rgba(255, 150, 50,  0.88)', label: 'Malo (26–50)'    },
  { color: 'rgba(255, 90,  90,  0.95)', label: 'Crítico (0–25)'  },
];

// Componente 

const AsphaltMap = forwardRef<AsphaltMapHandle, Props>(({ location }, ref) => {
  const { theme, isDark } = useTheme();
  const styles = makeStyles(theme, isDark);

  const mapRef          = useRef<MapView>(null);
  const lastLocationRef = useRef<LocationObject | null>(null);
  const regionRef       = useRef<Region | null>(null);
  const cacheRef        = useRef<Map<string, CalleEstado[]>>(new Map());
  const debounceRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [followUser,     setFollowUser]     = useState(true);
  const [heatmapVisible, setHeatmapVisible] = useState(false);
  const [calles,         setCalles]         = useState<CalleEstado[]>([]);
  const [loading,        setLoading]        = useState(false);

  // Fetch geometría desde Overpass
  const loadStreets = async (region: Region) => {
    // Clave de caché por bbox redondeado a 3 decimales (~100m precisión)
    const key = [
      region.latitude.toFixed(3),
      region.longitude.toFixed(3),
      region.latitudeDelta.toFixed(3),
    ].join(',');

    if (cacheRef.current.has(key)) {
      setCalles(cacheRef.current.get(key)!);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchStreetsInRegion(region);
      cacheRef.current.set(key, data);
      setCalles(data);
    } catch (e) {
      console.warn('[Heatmap] Overpass error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Al activar heatmap, cargar de inmediato con la región actual 
  useEffect(() => {
    if (heatmapVisible && regionRef.current) {
      loadStreets(regionRef.current);
    }
  }, [heatmapVisible]);

  // Al mover el mapa con heatmap activo, recargar con debounce
  const handleRegionChange = (region: Region) => {
    regionRef.current = region;
    if (!heatmapVisible) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadStreets(region), 1000);
  };

  // Imperative handle 
  useImperativeHandle(ref, () => ({
    navigateTo: (lat: number, lon: number) => {
      setFollowUser(false);
      mapRef.current?.animateToRegion(
        { latitude: lat, longitude: lon, latitudeDelta: 0.01, longitudeDelta: 0.01 },
        1000
      );
    },
  }));

  // Map styles 
  const lightMapStyle = [
    { elementType: 'geometry',                       stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'road',  elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e6ff' }] },
  ];
  const darkMapStyle = [
    { elementType: 'geometry',                       stylers: [{ color: '#2b2b2b' }] },
    { elementType: 'labels.text.fill',               stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'road',  elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
  ];

  // Seguimiento GPS 
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371000, r = (v: number) => v * Math.PI / 180;
    const dLat = r(lat2 - lat1), dLon = r(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const getRegion = (loc: LocationObject): Region => {
    const speed = loc.coords.speed ?? 0;
    const delta = speed > 25 ? 0.02 : speed > 15 ? 0.01 : 0.005;
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude, latitudeDelta: delta, longitudeDelta: delta };
  };

  useEffect(() => {
    if (!location || !followUser) return;
    const last = lastLocationRef.current;
    if (last && getDistance(last.coords.latitude, last.coords.longitude, location.coords.latitude, location.coords.longitude) < 15) return;
    lastLocationRef.current = location;
    const region = getRegion(location);
    mapRef.current?.animateToRegion(region, 500);
    regionRef.current = region;
  }, [location, followUser]);

  const goToUser      = () => {
    if (!location) return;
    lastLocationRef.current = null;
    setFollowUser(true);
    mapRef.current?.animateToRegion(getRegion(location), 500);
  };
  const handleUserPan = () => setFollowUser(false);
  const toggleHeatmap = () => setHeatmapVisible(p => !p);

  return (
    <>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        mapType={Platform.OS === 'ios' ? (isDark ? 'mutedStandard' : 'standard') : 'standard'}
        {...(Platform.OS === 'android' && { customMapStyle: isDark ? darkMapStyle : lightMapStyle })}
        showsUserLocation
        showsMyLocationButton={false}
        rotateEnabled
        pitchEnabled
        showsCompass
        compassOffset={{ x: 0, y: 150 }}
        onPanDrag={handleUserPan}
        followsUserLocation={false}
        onRegionChangeComplete={handleRegionChange}
      >
        <StreetQualityLayer calles={calles} visible={heatmapVisible} />
      </MapView>

      {/* Spinner mientras carga Overpass */}
      {heatmapVisible && loading && (
        <View style={styles.loadingBadge}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando calles…</Text>
        </View>
      )}

      {/* GPS */}
      <Pressable
        onPress={goToUser}
        style={({ pressed }) => [styles.gpsButton, pressed && styles.gpsButtonPressed]}
      >
        <MaterialIcons
          name={followUser ? 'gps-fixed' : 'gps-not-fixed'}
          size={24}
          color={followUser ? theme.colors.primary : theme.colors.textSecondary}
        />
      </Pressable>

      {/* Heatmap toggle */}
      <Pressable
        onPress={toggleHeatmap}
        style={({ pressed }) => [
          styles.heatmapButton,
          heatmapVisible && styles.heatmapButtonActive,
          pressed        && styles.heatmapButtonPressed,
        ]}
      >
        <MaterialIcons
          name="layers"
          size={24}
          color={heatmapVisible ? theme.colors.primary : theme.colors.textSecondary}
        />
      </Pressable>

      {/* Leyenda */}
      {heatmapVisible && (
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Estado de calles</Text>
          {LEYENDA.map(item => (
            <View key={item.label} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
});

export default AsphaltMap;

// Estilos 

const makeStyles = (theme: AppTheme, isDark: boolean) =>
  StyleSheet.create({
    gpsButton: {
      position: 'absolute', bottom: 250, right: theme.spacing.screenH,
      backgroundColor: theme.colors.surface, padding: theme.spacing[3.5],
      borderRadius: theme.borderRadius.full, borderWidth: 1,
      borderColor: theme.colors.border, ...theme.shadows.lg,
    },
    gpsButtonPressed: { backgroundColor: theme.colors.primaryMuted, borderColor: theme.colors.primaryBorder },
    heatmapButton: {
      position: 'absolute', bottom: 318, right: theme.spacing.screenH,
      backgroundColor: theme.colors.surface, padding: theme.spacing[3.5],
      borderRadius: theme.borderRadius.full, borderWidth: 1,
      borderColor: theme.colors.border, ...theme.shadows.lg,
    },
    heatmapButtonActive:  { backgroundColor: theme.colors.primaryMuted, borderColor: theme.colors.primaryBorder },
    heatmapButtonPressed: { opacity: 0.7 },
    loadingBadge: {
      position: 'absolute', bottom: 390, right: theme.spacing.screenH,
      backgroundColor: isDark ? 'rgba(26,39,68,0.92)' : 'rgba(255,255,255,0.94)',
      borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing[1.5],
      paddingHorizontal: theme.spacing[3], borderWidth: 1, borderColor: theme.colors.border,
      flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], ...theme.shadows.md,
    },
    loadingText: { fontSize: 11, color: theme.colors.textSecondary },
    legend: {
      position: 'absolute', top: 120, right: theme.spacing.screenH,
      backgroundColor: isDark ? 'rgba(26,39,68,0.92)' : 'rgba(255,255,255,0.94)',
      borderRadius: theme.borderRadius.lg, paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[3], borderWidth: 1, borderColor: theme.colors.border,
      minWidth: 148, ...theme.shadows.md,
    },
    legendTitle: {
      fontSize: 11, fontWeight: '600', color: theme.colors.textSecondary,
      marginBottom: theme.spacing[1.5], textTransform: 'uppercase', letterSpacing: 0.5,
    },
    legendRow: { flexDirection: 'row', alignItems: 'center', marginVertical: theme.spacing[0.5] },
    legendDot: { width: 10, height: 10, borderRadius: theme.borderRadius.full, marginRight: theme.spacing[2] },
    legendLabel: { fontSize: 11, color: theme.colors.text },
  });
