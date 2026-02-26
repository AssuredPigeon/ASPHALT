import AsphaltMap, { AsphaltMapHandle } from '@/components/map/AsphaltMap';
import DrivingDestinationModal from '@/components/map/DrivingDestinationModal';
import DrivingOverlay from '@/components/map/DrivingOverlay';
import SearchBar from '@/components/map/SearchBar';
import SearchModal from '@/components/map/SearchModal';
import SelectedPlaceCard from '@/components/map/SelectedPlaceCard';
import TripInfoBar from '@/components/map/TripInfoBar';
import { SensorManager } from '@/components/Sensor/SensorManager';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';
import { useDrivingMode } from '../../context/DrivingModeContext';

export default function HomeScreen() {
  const [location,     setLocation]     = useState<Location.LocationObject | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useTranslation();

  // Ref del handle de AsphaltMap para navegar programáticamente
  const mapRef   = useRef<AsphaltMapHandle>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);

  //  Estado modo conducción (contexto global) 
  const { isDriving, destination, startDriving, stopDriving } = useDrivingMode();

  //  Modal de selección de destino 
  const [destModalVisible, setDestModalVisible] = useState(false);

  //  Lugar seleccionado desde SearchModal para mostrar SelectedPlaceCard 
  const [selectedPlace, setSelectedPlace] = useState<{
    lat:  number;
    lon:  number;
    name: string;
  } | null>(null);

  // Destino pre-cargado que pasa a DrivingDestinationModal cuando viene desde SelectedPlaceCard
  const [preselectedDest, setPreselectedDest] = useState<{
    lat: number; lon: number; name: string;
  } | null>(null);

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

  // Abrir SearchModal
  const handleSearchActive = () => setModalVisible(true);

  // Navegar el mapa a la ubicación seleccionada
  const handleSelectLocation = (lat: number, lon: number, _name: string) => {
    mapRef.current?.navigateTo(lat, lon);
  };

  // Al tocar "Cómo llegar" en SearchModal → mostrar SelectedPlaceCard en el mapa
  const handleNavigateTo = (lat: number, lon: number, name: string) => {
    setSelectedPlace({ lat, lon, name });
  };

  // Al tocar "Cómo llegar" en SelectedPlaceCard → abrir modal de destino pre-cargado
  const handleStartDrivingFromCard = (lat: number, lon: number, name: string) => {
    setSelectedPlace(null);
    setPreselectedDest({ lat, lon, name });
    setDestModalVisible(true);
  };

  // Botón "Iniciar Modo Conducción" del SensorManager → abrir modal sin pre-carga
  const handleInitiateDriving = () => {
    setPreselectedDest(null);
    setDestModalVisible(true);
  };

  // Confirmar destino y arrancar modo conducción
  const handleStartDriving = (lat: number, lon: number, name: string) => {
    setDestModalVisible(false);
    setPreselectedDest(null);
    startDriving({ lat, lon, name });
    mapRef.current?.navigateTo(lat, lon);
  };

  // Detener modo conducción
  const handleStopDriving = () => {
    stopDriving();
  };

  return (
    <View style={styles.container}>

      {/* Mapa principal — isDriving sube los botones GPS/capas para no solapar el panel */}
      <AsphaltMap ref={mapRef} location={location} isDriving={isDriving} />

      {/* SearchBar — se oculta durante el modo conducción */}
      {!isDriving && (
        <SearchBar onActivate={handleSearchActive} />
      )}

      {/* Overlay de navegación activa (flecha + botón Detener) */}
      {isDriving && destination && (
        <DrivingOverlay
          destination={destination}
          location={location}
          onStop={handleStopDriving}
        />
      )}

      {/* Tarjeta de lugar seleccionado con "Cómo llegar" */}
      {selectedPlace && !isDriving && (
        <View style={styles.placeCardWrapper}>
          <SelectedPlaceCard
            name={selectedPlace.name}
            lat={selectedPlace.lat}
            lon={selectedPlace.lon}
            onClose={() => setSelectedPlace(null)}
            onStartDriving={handleStartDrivingFromCard}
          />
        </View>
      )}

      {/* Panel inferior: SensorManager + TripInfoBar */}
      <View style={styles.overlay}>
        <SensorManager
          location={location}
          isDriving={isDriving}
          onInitiateDriving={handleInitiateDriving}
        />

        {/* Barra de info del viaje — solo en modo conducción */}
        {isDriving && destination && (
          <TripInfoBar
            destination={destination}
            location={location}
          />
        )}
      </View>

      {/* Modal de selección de destino */}
      <DrivingDestinationModal
        visible={destModalVisible}
        onClose={() => setDestModalVisible(false)}
        onStart={handleStartDriving}
        location={location}
        preselected={preselectedDest}
      />

      {/* Modal de búsqueda general — oculto durante modo conducción */}
      {!isDriving && (
        <SearchModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSelectLocation={handleSelectLocation}
          onNavigateTo={handleNavigateTo}
          location={location}
        />
      )}

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
    gap:               0, // TripInfoBar y SensorManager tienen su propio margen
  },
  // Tarjeta de lugar: anclada justo por encima del panel inferior
  placeCardWrapper: {
    position:          'absolute',
    bottom:            150, // Por encima del overlay inferior
    left:              12,
    right:             12,
    zIndex:            20,
  },
});