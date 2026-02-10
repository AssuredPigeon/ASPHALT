import { Stack } from 'expo-router';
{/* Navegador tipo pila */}

{/* Envuelve y permite la navegación entre los archivos de la misma carpeta */}
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 150, }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
