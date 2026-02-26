import SplashScreen from "@/components/SplashScreen";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import '@/i18n';
import { ThemeProvider } from "@/theme/ThemeContext";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { AppSettingsProvider } from "../context/AppSettingsContext";
import { DrivingModeProvider } from '../context/DrivingModeContext'; // Contexto del modo conducción
import { MapSettingsProvider } from '../context/MapSettingsContext';

// Inner layout — ya dentro de ThemeProvider, puede usar useTheme 
function RootLayoutInner() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleSplashComplete = () => {
    setShowSplash(false);

    // Esperamos a que AuthContext termine de validar
    if (loading) return;

    if (user) {
      router.replace("/(tabs)");
    } else {
      router.replace("/login");
    }
  };

  // Si auth termina DESPUÉS del splash, redirigir
  useEffect(() => {
    if (showSplash || loading) return;
    if (user) {
      router.replace("/(tabs)");
    }
  }, [showSplash, loading, user]);

  // SplashScreen ahora SÍ está dentro de ThemeProvider
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

// Root: ThemeProvider es siempre el wrapper más externo 
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        {/* DrivingModeProvider envuelve todo para que la tab bar pueda leerlo */}
        <DrivingModeProvider>
          <MapSettingsProvider>
            <AppSettingsProvider>
              <RootLayoutInner />
            </AppSettingsProvider>
          </MapSettingsProvider>
        </DrivingModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}