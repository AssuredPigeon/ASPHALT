import AuthBackground from '@/components/ui/AuthBackground';
import AuthButton from '@/components/ui/AuthButton';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';

export default function ConfirmPasswordScreen() {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <AuthBackground />

      <Image
        source={require('../../assets/images/Logo_A.png')}
        style={styles.logo}
      />

      <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

      <View style={styles.card}>
        <Text style={styles.title}>{t('confirmPassword.title')}</Text>

        <AuthButton
          label={t('confirmPassword.loginButton')}
          onPress={() => router.replace('/login')}
        />
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
        textAlign: 'center',
        marginTop: 12,
        fontSize: 15,
        color: '#1E5EFF'
    },
    title: {
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
    },
});