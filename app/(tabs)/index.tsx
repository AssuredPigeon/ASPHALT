import { useEffect, useState } from 'react';
import { LayoutAnimation, Platform, UIManager, View } from 'react-native';

import AsphaltMap from '@/components/map/AsphaltMap';
import BottomActions from '@/components/map/BottomActions';
import SearchBar from '@/components/map/SearchBar';

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
      <SearchBar onActivate={activateSearch} />
      {searchActive && <BottomActions onClose={deactivateSearch} />}
    </View>
  );
}
