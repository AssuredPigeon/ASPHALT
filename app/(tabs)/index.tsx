import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, UIManager, View } from 'react-native';

import AsphaltMap from '@/components/map/AsphaltMap';
import BottomActions from '@/components/map/BottomActions';
import SearchBar from '@/components/map/SearchBar';
import { SensorModule } from '@/components/SensorModule';

export default function HomeScreen() {
  const [searchActive, setSearchActive] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  // Animaciones Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  // GPS
  useEffect(() => {
    let subscription: Location.LocationSubscription;

    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 5,
        },
        (loc) => {
          setLocation(loc);
        }
      );
    })();

    return () => {
      subscription?.remove();
    };
  }, []);

  const activateSearch = () => {
    LayoutAnimation.easeInEaseOut();
    setSearchActive(true);
  };

  const deactivateSearch = () => {
    LayoutAnimation.easeInEaseOut();
    setSearchActive(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <AsphaltMap location={location} />

      <View
        style={{
          position: 'absolute',
          top: 120,
          left: 20,
          right: 20,
          zIndex: 10,
        }}
      >
        <SensorModule location={location} />
      </View>

      <SearchBar onActivate={activateSearch} />
      {/* Condicional renderizada - condición && return*/}
      {searchActive && <BottomActions onClose={deactivateSearch} />}
    </View>
  );
}

