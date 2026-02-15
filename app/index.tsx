import { Redirect } from 'expo-router';

// Redirige al login por defecto.
// _layout.tsx maneja la lógica de si ir a /(tabs) o /login según el token.
export default function Index() {
  return <Redirect href="/login" />;
}