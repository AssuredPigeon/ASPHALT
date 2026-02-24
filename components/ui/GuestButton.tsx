import { lightTheme } from '@/theme/light';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  onPress?: () => void;
};

const { colors } = lightTheme;

export default function GuestButton({ onPress }: Props) {
  const router = useRouter(); // Hook
  const { t } = useTranslation();

  const handlePress = () => {
    if (onPress) {
      onPress(); // Ejecuta
    } else {
      router.replace('/(tabs)'); // Navega
    }
  };

  return (
    <Pressable style={styles.button} onPress={handlePress}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/icons/user.png')}
          style={styles.icon}
        />
        <Text style={styles.text}>{t('guest.button')}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop:       14,
    borderWidth:     1,
    borderColor:     colors.border,
    borderRadius:    14,
    paddingVertical: 12,
    alignItems:      'center',
    backgroundColor: colors.surface,
  },
  content: {
    flexDirection: 'row',
    alignItems:    'center',
  },
  icon: {
    width:       18,
    height:      18,
    resizeMode:  'contain',
    marginRight: 8,
  },
  text: {
    color:      colors.text,
    fontWeight: '500',
  },
});