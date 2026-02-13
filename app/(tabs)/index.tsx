import AsphaltMap from '@/components/map/AsphaltMap';
import SearchBar from '@/components/map/SearchBar';
import SearchModal from '@/components/map/SearchModal';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import MapView, { Region } from 'react-native-maps';
import { SensorModule } from '../../components/SensorModule';

export default function HomeScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const mapRef = useRef <MapView>(null);
  // Guardamos la suscripción para poder cancelarla al desmontar el componente
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    startLocationTracking();

    return () => {
      // Limpieza: detener el GPS cuando el usuario sale de la pantalla
      watchRef.current?.remove();
    };
  }, []);

  const startLocationTracking = async () => {
    // 1. Pedir permiso de ubicación
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Permiso denegado',
        'Asphalt necesita acceso a tu ubicación para funcionar. Actívalo en Configuración.',
        [{ text: 'OK' }]
      );
      return;
    }

    // accuracy: Location.Accuracy.BestForNavigation es OBLIGATORIO para que
    // location.coords.speed tenga datos reales (m/s).
    
    // Con Accuracy.Balanced o menor, el sistema NO reporta velocidad → speed = -1 o null.
  
    // timeInterval: 1000 → actualiza cada 1 segundo como mínimo
    // distanceInterval: 1 → O cuando el auto se mueve 1 metro (lo que ocurra primero)
    // Esto asegura que la velocidad sea fluida mientras el auto está en movimiento.
    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      (newLocation) => {
        setLocation(newLocation);
      }
    );
  };

  {/* Función q se activa cuando se presiona la barra */}
  const handleSearchActive = () => setModalVisible(true);

  const handleSelectLocation = (lat: number, lon: number, name: string) => {
    if (mapRef.current){
      const region: Region = {
        latitude: lat,
        longitude: lon,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(region, 1000);
    }
  }

  return (
    <View style={styles.container}>
      {/* Mapa de fondo - ocupa toda la pantalla */}
      <AsphaltMap location={location} />

      {/* Barra de búsqueda */}
      <SearchBar onActivate={handleSearchActive} />

      {/* Panel de sensores superpuesto en la parte inferior */}
      <View style={styles.overlay}>
        <SensorModule location={location} />
      </View>

      <SearchModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectLocation={handleSelectLocation}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 20,
  },
});