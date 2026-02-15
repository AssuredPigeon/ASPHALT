import SplashScreen from '@/components/SplashScreen';
import { ThemeProvider } from '@/theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';

// ── Inner layout — ya dentro de ThemeProvider, puede usar useTheme ─────────
function RootLayoutInner() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  const handleSplashComplete = async () => {
    setShowSplash(false);
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      router.replace('/(tabs)');
    } else {
      router.replace('/login');
    }
  };

  // SplashScreen ahora SÍ está dentro de ThemeProvider ✅
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

// ── Root: ThemeProvider es siempre el wrapper más externo ─────────────────
export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutInner />
    </ThemeProvider>
  );
}