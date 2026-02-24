import AsphaltMap, { AsphaltMapHandle } from '@/components/map/AsphaltMap';
import SearchBar from '@/components/map/SearchBar';
import SearchModal from '@/components/map/SearchModal';
import { SensorManager } from '@/components/Sensor/SensorManager';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const [location,     setLocation]     = useState<Location.LocationObject | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  // Ahora el ref apunta al handle de AsphaltMap, no al MapView directamente
  const mapRef = useRef<AsphaltMapHandle>(null);

  const watchRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    startLocationTracking();
    return () => {
      watchRef.current?.remove();
    };
  }, []);

  const startLocationTracking = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        t('map.permissionDenied'),
        t('map.permissionMessage'),
        [{ text: t('map.ok') }]
      );
      return;
    }

    watchRef.current = await Location.watchPositionAsync(
      {
        accuracy:         Location.Accuracy.BestForNavigation,
        timeInterval:     1000,
        distanceInterval: 1,
      },
      (newLocation) => setLocation(newLocation)
    );
  };

  const handleSearchActive = () => setModalVisible(true);

  // Ahora sí funciona: llama navigateTo dentro de AsphaltMap
  const handleSelectLocation = (lat: number, lon: number, _name: string) => {
    mapRef.current?.navigateTo(lat, lon);
  };

  return (
    <View style={styles.container}>
      {/* ref conectado al handle de AsphaltMap */}
      <AsphaltMap ref={mapRef} location={location} />

      <SearchBar onActivate={handleSearchActive} />

      {/* Aquí usamos el estilo del equipo, pero con tu SensorManager */}
      <View style={styles.overlay}>
        <SensorManager location={location} />
      </View>

      <SearchModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectLocation={handleSelectLocation}
        location={location}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    position:          'absolute',
    bottom:            0,
    left:              0,
    right:             0,
    paddingHorizontal: 10,
    paddingBottom:     20,
    zIndex:            10,
  },
});