import AuthBackground from '@/components/ui/AuthBackground';
import AuthButton from '@/components/ui/AuthButton';
import AuthInput from '@/components/ui/AuthInput';
import api from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  const { email } = useLocalSearchParams<{ email: string }>();
  console.log("EMAIL EN RESET:", email);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const validatePassword = (password: string) => {
  if (password.length < 8) {
    return t('resetPassword.errors.minLength');
  }

  if (/\s/.test(password)) {
    return t('resetPassword.errors.noSpaces');
  }

  if (!/[A-Za-z]/.test(password)) {
    return t('resetPassword.errors.needLetter');
  }

  if (!/[0-9]/.test(password)) {
    return t('resetPassword.errors.needNumber');
  }

  return null; // válida
};

    const handleLogin = async () => {

    const errorMessage = validatePassword(password);

    if (errorMessage) {
        Alert.alert('Error', errorMessage);
        return;
    }

    try {
        setLoading(true);

        await api.post('/auth/reset-password', {
        email,
        password
        });

        router.replace('/confirmPassword');

    } catch (error: any) {
        Alert.alert(
        'Error',
        error?.response?.data?.message || t('resetPassword.errors.generic')
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
      <Text style={styles.title}>{t('resetPassword.title')}</Text>


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

        <View style={styles.rulesBox}>
        <Text style={styles.rulesTitle}>{t('resetPassword.rulesTitle')}</Text>

        <Text style={[
            styles.ruleItem,
            password.length >= 8 && styles.ruleValid
        ]}>
            {t('resetPassword.rule1')}
        </Text>

        <Text style={[
            styles.ruleItem,
            /[A-Za-z]/.test(password) && styles.ruleValid
        ]}>
            {t('resetPassword.rule2')}
        </Text>

        <Text style={[
            styles.ruleItem,
            !/\s/.test(password) && password.length > 0 && styles.ruleValid
        ]}>
            {t('resetPassword.rule3')}
        </Text>

        <Text style={[
            styles.ruleItem,
            /[0-9]/.test(password) && styles.ruleValid
        ]}>
            {t('resetPassword.rule4')}
        </Text>
        </View>

        <AuthButton
          label={loading ? t('resetPassword.verifying') : t('resetPassword.continue')}
          onPress={handleLogin}
        />

        <Pressable onPress={() => router.push('/login')}>
          <Text style={[styles.helper]}>{t('resetPassword.back')}</Text>
        </Pressable>

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
    title: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 15,
    },
    rulesBox: {
    backgroundColor: '#DCE3F9',
    padding: 12,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 15,
    },

    rulesTitle: {
    fontWeight: '600',
    marginBottom: 6,
    },

    ruleItem: {
    fontSize: 13,
    marginBottom: 2,
    color: '#444',
    },

    ruleValid: {
    color: 'green',
    fontWeight: '600',
    },

    eyeButton: {
    position: 'absolute',
    right: 15,
    top: 18,
    },

    eyeText: {
    color: '#1E5EFF',
    fontSize: 13,
    fontWeight: '600',
    },


});