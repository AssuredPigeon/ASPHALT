import { lightTheme } from '@/theme/light';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
//{/* Pressable: manejo de estados (lo mejorcito) */}
type Props = {
  active: 'login' | 'register';
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
};

const { colors } = lightTheme;

export default function AuthTabs({ active, onLoginPress, onRegisterPress }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Pressable
          style={[styles.tab, active === 'login' && styles.activeTab]}
          onPress={onLoginPress}
        >
          <Text style={[styles.text, active === 'login' && styles.activeText]}>
            {t('authTabs.login')}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, active === 'register' && styles.activeTab]}
          onPress={onRegisterPress}
        >
          <Text style={[styles.text, active === 'register' && styles.activeText]}>
            {t('authTabs.register')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Espaciado bottom
  wrapper: {
    marginBottom: 20,
  },
  container: {
    flexDirection:   'row',
    backgroundColor: colors.backgroundSecondary,
    borderRadius:    30,
    padding:         4,
  },
  tab: {
    flex:            1,
    paddingVertical: 10,
    borderRadius:    25,
    alignItems:      'center',
  },
  activeTab: {
    backgroundColor: colors.surface,
  },
  text: {
    color:    colors.textTertiary,
    fontSize: 14,
  },
  activeText: {
    color:      colors.text,
    fontWeight: '600',
  },
});