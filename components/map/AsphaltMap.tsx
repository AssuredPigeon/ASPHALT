import { StyleSheet } from 'react-native';
import MapView, { UrlTile } from 'react-native-maps';

export default function AsphaltMap() {
  return (
    <MapView
      style={StyleSheet.absoluteFillObject}
      showsUserLocation
      showsMyLocationButton={true}
      initialRegion={{
      latitude: 20.6597,
      longitude: -103.3496,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }}

    >
      <UrlTile
        urlTemplate="https://a.tile.openstreetmap.org/titles/alidade_dark/{z}/{x}/{y}.png"
        maximumZ={20}
      />
    </MapView>
  );
}
