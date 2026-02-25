import api from '@/services/api';
import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { MaterialIcons } from '@expo/vector-icons';
import { LocationObject } from 'expo-location';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import MapView, { Region } from 'react-native-maps';

import { useMapSettings } from '../../app/MapSettingsContext';
import StreetQualityLayer, { CalleEstado } from './StreetQualityLayer';

// Define la forma
export type AsphaltMapHandle = {
  navigateTo: (lat: number, lon: number) => void;
};

// Tendrá esos parámetros
interface Props {
  location: LocationObject | null;
}

// Función que devuelve arreglo con info de calles
async function fetchStreetsFromAPI(region: Region): Promise<CalleEstado[]> {
  // Limites del mapa
  const south = region.latitude - region.latitudeDelta / 2;
  const north = region.latitude + region.latitudeDelta / 2;
  const west = region.longitude - region.longitudeDelta / 2;
  const east = region.longitude + region.longitudeDelta / 2;

  const { data } = await api.get('/api/calles/viewport', {
    params: { south, north, west, east, limit: 200 },
  });

  return data.calles;  // Ya viene en el formato que espera StreetQualityLayer
}

// Tipo de capa activa del menú flotante
// "none"    sin ninguna capa activada
// "heatmap" muestra el mapa de calor de calidad vial
// "3d"      inclina la cámara para mostrar edificios en perspectiva
type LayerMode = 'none' | 'heatmap' | '3d';

// Leyenda
const LEYENDA = [
  { color: 'rgba(50,  220, 90,  0.85)', label: 'Bueno (76–100)' },
  { color: 'rgba(245, 205, 30,  0.85)', label: 'Regular (51–75)' },
  { color: 'rgba(255, 150, 50,  0.88)', label: 'Malo (26–50)' },
  { color: 'rgba(255, 90,  90,  0.95)', label: 'Crítico (0–25)' },
];

// Componente que recibe un prop y se controla mediante ref
const AsphaltMap = forwardRef<AsphaltMapHandle, Props>(({ location }, ref) => {
  const { theme, isDark } = useTheme();
  const styles = makeStyles(theme, isDark);

  // Lee la preferencia de vista del contexto compartido con Settings
  const { mapView, setMapView } = useMapSettings();

  const mapRef = useRef<MapView>(null); // Guarda ref y es null de momento
  const lastLocationRef = useRef<LocationObject | null>(null); // Guarda la última locación conocida y es null de momento
  const regionRef = useRef<Region | null>(null); // Guarda la región actual visible y es null de momento
  const cacheRef = useRef<Map<string, CalleEstado[]>>(new Map()); 
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null); 

  const [followUser, setFollowUser] = useState(true);  // Controla si sigue al usuario o no
  const [menuOpen, setMenuOpen] = useState(false);  // controla visibilidad del menú de capas
  const [activeLayer, setActiveLayer] = useState<LayerMode>('none'); // define la capa activa
  const [calles, setCalles] = useState<CalleEstado[]>([]); // Calles que se mostrarán
  const [loading, setLoading] = useState(false); // UI de carga

  // Derivados para hacer el JSX más legible
  const heatmapVisible = activeLayer === 'heatmap';
  const is3D = activeLayer === '3d';

  // Reacciona al cambio de mapView desde Settings.
  useEffect(() => {
    if (mapView === '3d') {
      // Settings activó 3D = reflejarlo en el menú del mapa también
      setActiveLayer('3d');
      mapRef.current?.animateCamera({ pitch: 75, altitude: 400 }, { duration: 900 });
    } else {
      // Settings activó 2D = limpiar el 3D del menú y aplanar cámara
      if (activeLayer === '3d') setActiveLayer('none');
      mapRef.current?.animateCamera({ pitch: 0, altitude: 1500 }, { duration: 600 });
    }
  }, [mapView]);

  // Fetch geometría desde el backend
  const loadStreets = async (region: Region) => {
    console.log('[Heatmap] loadStreets llamado, location:', location ? 'SÍ' : 'NULL');

    const center = location ? {
      lat: location.coords.latitude,
      lng: location.coords.longitude,
    } : {
      lat: region.latitude,
      lng: region.longitude,
    };

    const radio = 0.01; // ~1km alrededor del usuario
    const fixedRegion: Region = {
      latitude: center.lat,
      longitude: center.lng,
      latitudeDelta: radio * 2,
      longitudeDelta: radio * 2,
    };

    const key = `${center.lat.toFixed(3)},${center.lng.toFixed(3)}`;

    if (cacheRef.current.has(key)) {
      setCalles(cacheRef.current.get(key)!);
      return;
    }

    setLoading(true);
    try {
      const data = await fetchStreetsFromAPI(fixedRegion);
      cacheRef.current.set(key, data);
      setCalles(data);
    } catch (e) {
      //console.warn('[Heatmap] error:', e);
    } finally {
      setLoading(false);
    }
  };

  // Al activar heatmap, cargar de inmediato
  useEffect(() => {
    if (heatmapVisible && location) {
      const region: Region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      loadStreets(region);
    }
  }, [heatmapVisible, location]);

  // Al mover el mapa con heatmap activo, recargar con debounce
  const handleRegionChange = (region: Region) => {
    regionRef.current = region;
    if (!heatmapVisible) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadStreets(region), 1000);
  };

  // Vista 3D: pitch 75 grados para ver los edificios en perspectiva pronunciada.
  // altitude 400 acerca la cámara para que los edificios sean más notorios.
  const enter3D = () => {
    mapRef.current?.animateCamera(
      { pitch: 75, altitude: 400 },
      { duration: 900 }
    );
  };

  // Al salir del 3D se restablece pitch 0 para volver a la vista aérea plana.
  // Si Settings tiene el 3D activo, se respeta y no se aplana.
  const exit3D = () => {
    const targetPitch = mapView === '3d' ? 75 : 0;
    const targetAltitude = mapView === '3d' ? 400 : 1500;
    mapRef.current?.animateCamera(
      { pitch: targetPitch, altitude: targetAltitude },
      { duration: 600 }
    );
  };

  // Selección de capa desde el menú flotante.
  // Si el usuario toca la capa que ya está activa, la desactiva.
  const selectLayer = (mode: LayerMode) => {
    setMenuOpen(false);

    if (activeLayer === mode) {
      if (mode === '3d') {
        exit3D();
        setMapView('2d');   // sincroniza contexto y Settings se entera
      }
      setActiveLayer('none');
      return;
    }

    if (activeLayer === '3d') exit3D();

    setActiveLayer(mode);
    if (mode === '3d') {
      enter3D();
      setMapView('3d'); // sincroniza contexto y Settings se entera
    }
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
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e6ff' }] },
  ];
  const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#2b2b2b' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#3a3a3a' }] },
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

  const goToUser = () => {
    if (!location) return;
    lastLocationRef.current = null;
    setFollowUser(true);
    mapRef.current?.animateToRegion(getRegion(location), 500);
  };
  const handleUserPan = () => setFollowUser(false);

  // El mapa está en 3D si el menú del mapa lo activó O si Settings lo tiene en '3d'
  const mapIs3D = is3D || mapView === '3d';

  return (
    <>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        mapType={Platform.OS === 'ios' ? (isDark ? 'mutedStandard' : 'standard') : 'standard'}
        {...(Platform.OS === 'android' && { customMapStyle: isDark ? darkMapStyle : lightMapStyle })}
        showsUserLocation
        showsMyLocationButton={false}
        showsBuildings       // habilita edificios 3D nativos del mapa
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

      {/* Capa transparente que cierra el menú al tocar fuera de él */}
      {menuOpen && (
        <TouchableWithoutFeedback onPress={() => setMenuOpen(false)}>
          <View style={StyleSheet.absoluteFillObject} />
        </TouchableWithoutFeedback>
      )}

      {/* Spinner mientras carga la API */}
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

      {/* Menú flotante de capas, aparece a la izquierda del botón layers */}
      {menuOpen && (
        <View style={styles.layerMenu}>

          <Pressable
            onPress={() => selectLayer('heatmap')}
            style={({ pressed }) => [
              styles.menuItem,
              heatmapVisible && styles.menuItemActive,
              pressed && styles.menuItemPressed,
            ]}
          >
            <View style={[styles.menuIcon, heatmapVisible && styles.menuIconActive]}>
              <MaterialIcons
                name="whatshot"
                size={18}
                color={heatmapVisible ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
            <Text style={[styles.menuLabel, heatmapVisible && styles.menuLabelActive]}>
              Mapa de calor
            </Text>
            {heatmapVisible && (
              <MaterialIcons name="check" size={14} color={theme.colors.primary} />
            )}
          </Pressable>

          <View style={styles.menuDivider} />

          <Pressable
            onPress={() => selectLayer('3d')}
            style={({ pressed }) => [
              styles.menuItem,
              is3D && styles.menuItemActive,
              pressed && styles.menuItemPressed,
            ]}
          >
            <View style={[styles.menuIcon, is3D && styles.menuIconActive]}>
              <MaterialIcons
                name="view-in-ar"
                size={18}
                color={is3D ? theme.colors.primary : theme.colors.textSecondary}
              />
            </View>
            <Text style={[styles.menuLabel, is3D && styles.menuLabelActive]}>
              Vista 3D
            </Text>
            {is3D && (
              <MaterialIcons name="check" size={14} color={theme.colors.primary} />
            )}
          </Pressable>

        </View>
      )}

      {/* Botón layers: abre el menú de capas. Se ilumina si hay alguna capa activa */}
      <Pressable
        onPress={() => setMenuOpen(p => !p)}
        style={({ pressed }) => [
          styles.heatmapButton,
          (menuOpen || activeLayer !== 'none') && styles.heatmapButtonActive,
          pressed && styles.heatmapButtonPressed,
        ]}
      >
        <MaterialIcons
          name="layers"
          size={24}
          color={(menuOpen || activeLayer !== 'none') ? theme.colors.primary : theme.colors.textSecondary}
        />
      </Pressable>

      {/* Leyenda de colores, visible solo cuando el heatmap está activo */}
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

      {/* Badge que indica que el mapa está en 3D, ya sea por el menú o por Settings */}
      {mapIs3D && (
        <View style={styles.badge3D}>
          <Text style={styles.badge3DText}>3D</Text>
        </View>
      )}
    </>
  );
});

export default AsphaltMap;

// Estilos
const makeStyles = (theme: AppTheme, isDark: boolean) => {
  const panel = isDark ? 'rgba(26,39,68,0.96)' : 'rgba(255,255,255,0.97)';

  return StyleSheet.create({
    gpsButton: {
      position: 'absolute', bottom: 250, right: theme.spacing.screenH,
      backgroundColor: theme.colors.surface, padding: theme.spacing[3.5],
      borderRadius: theme.borderRadius.full, borderWidth: 1,
      borderColor: theme.colors.border, ...theme.shadows.lg,
    },
    gpsButtonPressed: { backgroundColor: theme.colors.primaryMuted, borderColor: theme.colors.primaryBorder },

    // Botón layers, misma posición y tamaño que el anterior heatmapButton
    heatmapButton: {
      position: 'absolute', bottom: 318, right: theme.spacing.screenH,
      backgroundColor: theme.colors.surface, padding: theme.spacing[3.5],
      borderRadius: theme.borderRadius.full, borderWidth: 1,
      borderColor: theme.colors.border, ...theme.shadows.lg,
    },
    heatmapButtonActive: { backgroundColor: theme.colors.primaryMuted, borderColor: theme.colors.primaryBorder },
    heatmapButtonPressed: { opacity: 0.7 },

    // Menú flotante que aparece a la izquierda del botón layers
    layerMenu: {
      position: 'absolute',
      bottom: 318,
      right: theme.spacing.screenH + 56,
      backgroundColor: panel,
      borderRadius: theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
      minWidth: 175,
      ...theme.shadows.xl,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing[3],
      paddingHorizontal: theme.spacing[3.5],
      gap: theme.spacing[2.5],
    },
    menuItemActive: { backgroundColor: theme.colors.primaryMuted },
    menuItemPressed: { opacity: 0.7 },
    menuIcon: {
      width: 32, height: 32,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuIconActive: { backgroundColor: theme.colors.primaryMuted },
    menuLabel: {
      flex: 1,
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    menuLabelActive: { color: theme.colors.text },
    menuDivider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginHorizontal: theme.spacing[3],
    },

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

    // Badge pequeño que aparece cuando el mapa está en 3D
    badge3D: {
      position: 'absolute',
      top: 120,
      right: theme.spacing.screenH,
      backgroundColor: theme.colors.primaryMuted,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing[1],
      paddingHorizontal: theme.spacing[2.5],
      borderWidth: 1,
      borderColor: theme.colors.primaryBorder,
      ...theme.shadows.sm,
    },
    badge3DText: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.primary,
      letterSpacing: 1,
    },
  });
};
