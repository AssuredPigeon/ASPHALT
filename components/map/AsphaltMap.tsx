import { MaterialIcons } from '@expo/vector-icons';
import { LocationObject } from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';


interface Props {
  location: LocationObject | null;
}

export default function AsphaltMap({ location }: Props) {
  const mapRef = useRef<MapView>(null);
  const [followUser, setFollowUser] = useState(true);

  // Cuando cambia la ubicación
  useEffect(() => {
    if (location && followUser) {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [location, followUser]);

  const goToUser = () => {
    if (!location) return;

    setFollowUser(true);

    mapRef.current?.animateToRegion({
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleRegionChange = () => {
    // Si el usuario mueve el mapa manualmente → deja de seguir
    setFollowUser(false);
  };

  return (
    <>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        showsUserLocation
        onPanDrag={handleRegionChange}
        initialRegion={{
          latitude: 20.6597,
          longitude: -103.3496,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/alidade_dark/{z}/{x}/{y}.png"
          maximumZ={20}
        />
      </MapView>

      {/* Botón tipo Google Maps */}
      <Pressable
        onPress={goToUser}
        style={{
          position: 'absolute',
          bottom: 140,
          right: 20,
          backgroundColor: 'white',
          padding: 14,
          borderRadius: 30,
          elevation: 5,
        }}
      >
        <MaterialIcons name="gps-fixed" size={24} color="#2c3e50" />
      </Pressable>
    </>
  );
}
