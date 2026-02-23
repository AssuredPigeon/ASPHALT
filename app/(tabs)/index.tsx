import { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, UIManager, View } from 'react-native';

import AsphaltMap from '@/components/map/AsphaltMap';
import BottomActions from '@/components/map/BottomActions';
import SearchBar from '@/components/map/SearchBar';
import { SensorManager } from '@/components/Sensor/SensorManager';

export default function HomeScreen() {
  const [searchActive, setSearchActive] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
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
      <AsphaltMap />

      <View style={{ position: 'absolute', top: 120, left: 20, right: 20, zIndex: 10 }}>
        
        {/*SE REMPLAZO SensorModule por SensorManager */}
        <SensorManager />
        
      </View>

      <SearchBar onActivate={activateSearch} />
      
      {searchActive && <BottomActions onClose={deactivateSearch} />}
    </View>
  );
}