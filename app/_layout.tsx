import SplashScreen from '@/components/SplashScreen';
import { Stack } from 'expo-router';
import { useState } from 'react';

export default function RootLayout() {
  {/* Inicia en true */}
  const [showSplash, setShowSplash] = useState(true);

  {/* Mientras esté activo, el stack (layout principal) no existe */}
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
