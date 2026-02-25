import { createContext, useContext, useState } from 'react';

// Configuración global del mapa que se comparte entre pantallas
interface MapSettings {
  mapView: '2d' | '3d';
  setMapView: (v: '2d' | '3d') => void;
}

const MapSettingsContext = createContext<MapSettings | undefined>(undefined);

export const MapSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  // Por defecto 2D según el requerimiento
  const [mapView, setMapView] = useState<'2d' | '3d'>('2d');

  return (
    <MapSettingsContext.Provider value={{ mapView, setMapView }}>
      {children}
    </MapSettingsContext.Provider>
  );
};

export const useMapSettings = () => {
  const context = useContext(MapSettingsContext);
  if (!context) throw new Error('useMapSettings must be used inside MapSettingsProvider');
  return context;
};
