import AuthBackground from '@/components/ui/AuthBackground';
import AuthButton from '@/components/ui/AuthButton';
import AuthInput from '@/components/ui/AuthInput';
import AuthTabs from '@/components/ui/AuthTabs';
import GuestButton from '@/components/ui/GuestButton';
import api from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Ingresa un correo electrónico válido');
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    try {
      setLoading(true);

      const res = await api.post('/auth/login', {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      const token = res?.data?.token;

      if (rememberMe && token) {
        await AsyncStorage.setItem('userToken', token);
      }

      console.log('Usuario:', res.data);

      // 🔜 aquí luego guardaremos sesión (token / usuario)
      router.replace('/(tabs)');

    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Correo o contraseña incorrectos'
      );
    } finally {
      setLoading(false);
    }
  };

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
          active="login"
          onRegisterPress={() => router.push('/register')}
        />

        <AuthInput
          icon="mail-outline"
          placeholder="Correo electrónico"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={{ position: 'relative' }}>
          <AuthInput
            icon="lock-closed-outline"
            placeholder="Contraseña"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: 15,
              top: 18,
            }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#64748B"
            />
          </Pressable>

        </View>

        <Pressable
          onPress={() => setRememberMe(!rememberMe)}
          style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}
        >
          <Ionicons
            name={rememberMe ? 'checkbox' : 'square-outline'}
            size={20}
            color={rememberMe ? '#1E5EFF' : '#64748B'}
          />

          <Text style={{ marginLeft: 8, fontSize: 13, color: '#334155' }}>
            Recuérdame
          </Text>
        </Pressable>

        <AuthButton
          label={loading ? 'Ingresando...' : 'Inicia Sesión'}
          onPress={handleLogin}
        />

        <Pressable onPress={() => router.push('/recoverPassword')}>
          <Text style={[styles.helper]}>
            ¿Has olvidado tu contraseña?
          </Text>
        </Pressable>

        <GuestButton />
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
  helper: {
    marginTop: 12,
    fontSize: 12,
    color: '#1E5EFF',
    textAlign: 'right',
  },
});
