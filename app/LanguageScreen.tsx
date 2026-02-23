import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const LANGUAGES = [
  { code: 'es', key: 'language.spanish', flag: '🇪🇸' },
  { code: 'en', key: 'language.english', flag: '🇺🇸' },
];

export default function LanguageScreen() {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();

  const selectLanguage = async (code: string) => {
    await AsyncStorage.setItem('appLanguage', code);
    i18n.changeLanguage(code);
    router.back();
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.background,
          paddingTop: 60,
          paddingHorizontal: 20,
        },
      ]}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('language.title')}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* LISTA DE IDIOMAS */}
      {LANGUAGES.map((lang) => (
        <Pressable
          key={lang.code}
          onPress={() => selectLanguage(lang.code)}
          style={[
            styles.row,
            { borderBottomColor: theme.colors.divider },
          ]}
        >
          <View style={styles.left}>
            <Text style={styles.flag}>
              {lang.flag}
            </Text>

            <Text style={[styles.label, { color: theme.colors.text }]}>
              {t(lang.key)}
            </Text>
          </View>

          {i18n.language === lang.code && (
            <Ionicons
              name="checkmark"
              size={22}
              color={theme.colors.tabActive}
            />
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flag: {
    fontSize: 22,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
  },
});