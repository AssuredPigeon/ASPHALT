import SplashScreen from '@/components/SplashScreen';
import { Stack } from 'expo-router';
import { useState } from 'react';

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}
