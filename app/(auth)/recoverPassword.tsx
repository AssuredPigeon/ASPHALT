import AuthBackground from '@/components/ui/AuthBackground';
import AuthButton from '@/components/ui/AuthButton';
import AuthInput from '@/components/ui/AuthInput';
import api from '@/services/api';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRecover = async () => {
        // Validación básica de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Ingresa un correo electrónico válido');
            return;
        }

        try {
            setLoading(true);

            await api.post('/auth/forgot-password', { email });

            // Si llega aquí significa que el correo existe y el código fue enviado
            router.push({
                pathname: '/codePassword',
                params: { email } // enviamos el email a la siguiente pantalla
            });

        } catch (error: any) {
            console.error(error);
            Alert.alert(
                'Error',
                error?.response?.data?.message || 'Ocurrió un error al enviar el correo.'
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

                <Text style={styles.title}>Recuperar Contraseña</Text>

                <AuthInput
                    icon="mail-outline"
                    placeholder="Correo electrónico"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <AuthButton
                    label={loading ? 'Ingresando...' : 'Continuar'}
                    onPress={handleRecover}
                />

                <Pressable onPress={() => router.push('/login')}>
                    <Text style={[styles.helper]}>
                        Iniciar Sesion
                    </Text>
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
