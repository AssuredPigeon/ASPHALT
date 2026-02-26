import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type DistanceUnit = 'mi' | 'km';

export interface AppSettings {
  // General
  units: DistanceUnit;

  // Map
  autoFocus: boolean;

  // Voice
  voiceVolume:   number;   // 0..1
  muteCalls:     boolean;
  selectedVoice: string;   // identifier de la voz del sistema, vacío = voz por defecto
}

interface AppSettingsContextValue extends AppSettings {
  setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  isLoaded: boolean;
}

const STORAGE_KEY = '@app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  units:         'mi',
  autoFocus:     true,
  voiceVolume:   0.7,
  muteCalls:     true,
  selectedVoice: '',
};

const AppSettingsContext = createContext<AppSettingsContextValue | null>(null);

export function AppSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // carga desde AsyncStorage al montar, hace merge con defaults para no perder keys nuevas
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setSettings((prev) => ({ ...prev, ...JSON.parse(raw) }));
      })
      .catch(console.warn)
      .finally(() => setIsLoaded(true));
  }, []);

  // setter genérico, actualiza estado y persiste en un solo paso
  const setSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => {
        const next = { ...prev, [key]: value };
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(console.warn);
        return next;
      });
    },
    [],
  );

  return (
    <AppSettingsContext.Provider value={{ ...settings, setSetting, isLoaded }}>
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) throw new Error('useAppSettings must be used inside <AppSettingsProvider>');
  return ctx;
}
