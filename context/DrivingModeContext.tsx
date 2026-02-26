import React, { createContext, useContext, useState } from 'react';

// Datos del destino seleccionado
export interface DrivingDestination {
  lat:  number;
  lon:  number;
  name: string;
}

// Modo de audio durante la conducción
export type SoundMode = 'narration' | 'alerts' | 'mute';

interface DrivingModeContextType {
  isDriving:    boolean;
  destination:  DrivingDestination | null;
  soundMode:    SoundMode;            // Controla el nivel de audio durante la conducción
  setSoundMode: (m: SoundMode) => void;
  startDriving: (dest: DrivingDestination) => void;
  stopDriving:  () => void;
}

const DrivingModeContext = createContext<DrivingModeContextType | undefined>(undefined);

export const DrivingModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDriving,   setIsDriving]   = useState(false);
  const [destination, setDestination] = useState<DrivingDestination | null>(null);

  // Por defecto narración completa — el usuario puede bajar a alertas o silencio
  const [soundMode, setSoundMode] = useState<SoundMode>('narration');

  const startDriving = (dest: DrivingDestination) => {
    setDestination(dest);
    setIsDriving(true);
  };

  const stopDriving = () => {
    setIsDriving(false);
    setDestination(null);
    setSoundMode('narration'); // Resetear audio al detener
  };

  return (
    <DrivingModeContext.Provider value={{
      isDriving,
      destination,
      soundMode,
      setSoundMode,
      startDriving,
      stopDriving,
    }}>
      {children}
    </DrivingModeContext.Provider>
  );
};

export const useDrivingMode = () => {
  const ctx = useContext(DrivingModeContext);
  if (!ctx) throw new Error('useDrivingMode must be inside DrivingModeProvider');
  return ctx;
};