import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { View } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) return <View />;
  if (user) return <Redirect href="/(tabs)" />;
  return <Redirect href="/login" />;
}