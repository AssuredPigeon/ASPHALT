import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

const initI18n = async () => {
  // Lee el idioma guardado por el usuario
  const savedLang = await AsyncStorage.getItem('appLanguage');
  // Si no, detecta el idioma
  const deviceLang = Localization.getLocales()[0]?.languageTag.startsWith('es') ? 'es' : 'en';

  await i18n.use(initReactI18next).init({
    resources: {
      es: { translation: es },
      en: { translation: en },
    },
    lng: savedLang ?? deviceLang, // Si hay uno guardado usa ese, si no, el del cel
    fallbackLng: 'es', // pero si algo falla, usa español
    interpolation: { escapeValue: false },
  });
};

initI18n();

export default i18n;