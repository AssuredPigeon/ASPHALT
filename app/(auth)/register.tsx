import AuthBackground from '@/components/ui/AuthBackground';
import AuthButton from '@/components/ui/AuthButton';
import AuthInput from '@/components/ui/AuthInput';
import AuthTabs from '@/components/ui/AuthTabs';
import SocialAuth from '@/components/ui/SocialAuth';
import { useRouter } from 'expo-router';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <AuthBackground />

      <Image
        source={require('../../assets/images/Logo_A.png')}
        style={styles.logo}
      />

      <Text style={styles.subtitle}>
        Las calles no avisan.{'\n'}Asphalt sí.
      </Text>

      <View style={styles.card}>
        <AuthTabs
          active="register"
          onLoginPress={() => router.push('/login')}
        />

        <AuthInput icon="mail-outline" placeholder="Correo electrónico" />
        <AuthInput icon="lock-closed-outline" placeholder="Contraseña" />

        <AuthButton label="Regístrate" />

        <SocialAuth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    paddingTop: 80,
  },
  logo: {
    width: 260,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  subtitle: {
    color: '#CBD5E1',
    textAlign: 'center',
    marginBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    width: '90%',
    borderRadius: 24,
    padding: 20,
  },
});
