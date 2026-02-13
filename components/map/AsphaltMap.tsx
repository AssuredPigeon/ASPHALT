import { MaterialIcons } from '@expo/vector-icons';
import { LocationObject } from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import MapView, { Region, UrlTile } from 'react-native-maps';

interface Props {
  location: LocationObject | null;
}

export default function AsphaltMap({ location }: Props) {
  const mapRef = useRef<MapView>(null);
  const [followUser, setFollowUser] = useState(true);

  // Calcula el delta según velocidad (zoom dinámico)
  const getRegion = (location: LocationObject): Region => {
    const speed = location.coords.speed ?? 0; // en m/s

    let delta = 0.005; // muy cerca (ciudad, detenido)

    if (speed > 25) delta = 0.02;    // carretera alta velocidad
    else if (speed > 15) delta = 0.01; // velocidad media
    else delta = 0.005;               // muy cerca

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: delta,
      longitudeDelta: delta,
    };
  };

  // Seguimiento real tipo navegación
  useEffect(() => {
    if (!location || !followUser) return;

    const region = getRegion(location);

    mapRef.current?.animateToRegion(region, 400); // animación suave
  }, [location, followUser]);

  // Botón para volver a centrar
  const goToUser = () => {
    if (!location) return;
    setFollowUser(true);
  };

  // Si el usuario mueve el mapa, se desactiva el seguimiento
  const handleUserPan = () => {
    setFollowUser(false);
  };

  return (
    <>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        showsMyLocationButton={false}
        rotateEnabled
        pitchEnabled
        onPanDrag={handleUserPan}
        userLocationPriority="high"
        followsUserLocation={false} // control manual
      >
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/alidade_dark/{z}/{x}/{y}.png"
          maximumZ={20}
        />
      </MapView>

      {/* Botón estilo Google Maps */}
      <Pressable
        onPress={goToUser}
        style={styles.gpsButton}
      >
        <MaterialIcons
          name={followUser ? 'gps-fixed' : 'gps-not-fixed'}
          size={24}
          color="#2c3e50"
        />
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  gpsButton: {
    position: 'absolute',
    bottom: 220,
    right: 20,
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 30,
    elevation: 6,
  },
});
