import AuthBackground from '@/components/ui/AuthBackground';
import AuthButton from '@/components/ui/AuthButton';
import api from '@/services/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

    export default function CodePasswordScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams();
    const { t } = useTranslation();

    const [code, setCode] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    const inputs = useRef<(TextInput | null)[]>([])

    const handleChange = (text: string, index: number) => {
        if (!/^[0-9]?$/.test(text)) return;

        const newCode = [...code];
        newCode[index] = text;
        setCode(newCode);

        // Ir al siguiente input automáticamente
        if (text && index < 5) {
        inputs.current[index + 1]?.focus();
        }

        // Si borra, regresar al anterior
        if (!text && index > 0) {
        inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        const finalCode = code.join('');

        if (finalCode.length !== 6) {
        Alert.alert('Error', t('code.errors.sixDigits'));
        return;
        }

        try {
        setLoading(true);

        await api.post('/auth/verify-code', {
            email,
            code: finalCode
        });

        // Si es correcto → ir a resetPassword
        router.push(`/resetPassword?email=${email}`);


        } catch (error: any) {
        Alert.alert(
            'Error',
            error?.response?.data?.message || t('code.errors.wrongCode')
        );
        } finally {
        setLoading(false);
        }
    };

    const handleResendCode = async () => {
    try {
        setLoading(true);

        await api.post('/auth/forgot-password', { email });

        Alert.alert(t('map.ok'), t('code.resendSuccess'));

    } catch (error: any) {
        Alert.alert(
        'Error',
        error?.response?.data?.message || t('code.errors.resendError')
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

                <Text style={styles.title}>{t('code.inboxTitle')}</Text>
                <Text style={styles.text}>{t('code.enterCode')}</Text>

                <View style={styles.otpContainer}>
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => {
                            inputs.current[index] = ref;
                            }}
                            style={styles.otpInput}
                            keyboardType="number-pad"
                            maxLength={1}
                            value={digit}
                            onChangeText={(text) => handleChange(text, index)}
                        />
                    ))}
                </View>

                <AuthButton
                    label={loading ? t('code.verifying') : t('code.continue')}
                    onPress={handleVerify}
                />

                <Pressable onPress={handleResendCode}>
                <Text style={styles.helper}>{t('code.resend')}</Text>
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
        marginBottom: 4,
    },
    text: {
        textAlign: 'center',
        marginBottom: 30,
        fontSize: 15,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 20,
    },

    otpInput: {
        width: 45,
        height: 55,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: 'bold',
        backgroundColor: '#F3F4F6',
    },

});