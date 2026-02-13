import SplashScreen from '@/components/SplashScreen';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootLayout() {
  {/* Inicia en true */}
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

    {/* Mientras esté activo, el stack (layout principal) no existe */}
    if (showSplash) {
      return <SplashScreen onComplete={handleSplashComplete} />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
  }