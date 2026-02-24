import AuthBackground from '@/components/ui/AuthBackground';
import AuthButton from '@/components/ui/AuthButton';
import AuthInput from '@/components/ui/AuthInput';
import AuthTabs from '@/components/ui/AuthTabs';
import SocialAuth from '@/components/ui/SocialAuth';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', t('auth.errors.fillFields'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', t('auth.errors.invalidEmail'));
      return;
    }

    if (password.length < 8) {
      Alert.alert('Error', t('auth.errors.shortPassword'));
      return;
    }

    try {
      setLoading(true);

      await api.post('/auth/register', {
        email,
        password,
      });

      Alert.alert(
        t('auth.registerSuccess'),
        t('auth.registerSuccessMsg'),
        [
          {
            text: t('map.ok'),
            onPress: () => router.replace('/login'),
          },
        ]
      );

    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.response?.data?.message || t('auth.errors.registerError')
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

      <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

      <View style={styles.card}>
        <AuthTabs
          active="register"
          onLoginPress={() => router.push('/login')}
        />

        <AuthInput
          icon="mail-outline"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={{ position: 'relative' }}>
          <AuthInput
            icon="lock-closed-outline"
            placeholder={t('auth.passwordPlaceholder')}
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

        <AuthButton
          label={loading ? t('auth.registering') : t('auth.registerButton')}
          onPress={handleRegister}
        />

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