import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAppSettings } from './AppSettingsContext';

// texto de muestra que se reproduce al tocar preview
const PREVIEW_TEXT = 'Turn left in 300 meters onto Main Street.';

export default function VoiceScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { t } = useTranslation();

  // selectedVoice y voiceVolume vienen del contexto, persisten en AsyncStorage
  const { selectedVoice, voiceVolume, setSetting } = useAppSettings();

  const [voices,        setVoices]        = useState<Speech.Voice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(true);
  const [playingId,     setPlayingId]     = useState<string | null>(null);

  // carga las voces del sistema al montar, filtra inglés y ordena por nombre
  useEffect(() => {
    Speech.getAvailableVoicesAsync()
      .then((v) => {
        const filtered = v
          .filter((voice) => voice.language.startsWith('en'))
          .sort((a, b) => a.name.localeCompare(b.name));
        setVoices(filtered);
      })
      .catch(console.warn)
      .finally(() => setLoadingVoices(false));
  }, []);

  function handleSelect(identifier: string) {
    setSetting('selectedVoice', identifier);
  }

  function handlePreview(voice: Speech.Voice) {
    // si ya está reproduciendo esta voz, la detiene
    if (playingId === voice.identifier) {
      Speech.stop();
      setPlayingId(null);
      return;
    }

    Speech.stop();
    setPlayingId(voice.identifier);

    Speech.speak(PREVIEW_TEXT, {
      voice:   voice.identifier,
      volume:  voiceVolume,
      onDone:  () => setPlayingId(null),
      onError: () => setPlayingId(null),
    });
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => {
            // detiene el audio antes de salir
            Speech.stop();
            router.back();
          }}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.title}>{t('settings.currentVoice')}</Text>

        {/* Spacer para centrar título */}
        <View style={{ width: 34 }} />
      </View>

      {loadingVoices ? (
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {voices.map((voice) => {
            const isSelected   = selectedVoice === voice.identifier;
            const isPreviewing = playingId === voice.identifier;

            return (
              <Pressable
                key={voice.identifier}
                onPress={() => handleSelect(voice.identifier)}
                style={({ pressed }) => [
                  styles.card,
                  isSelected && styles.cardSelected,
                  pressed   && styles.cardPressed,
                ]}
              >
                {/* nombre e idioma de la voz */}
                <View style={styles.cardInfo}>
                  <Text style={[styles.voiceName, isSelected && styles.voiceNameSelected]}>
                    {voice.name}
                  </Text>
                  <Text style={styles.voiceLang}>{voice.language}</Text>
                </View>

                {/* checkmark si está seleccionada + botón de preview */}
                <View style={styles.cardActions}>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={theme.colors.primary}
                      style={styles.checkIcon}
                    />
                  )}
                  <Pressable
                    onPress={() => handlePreview(voice)}
                    style={({ pressed }) => [
                      styles.previewButton,
                      pressed && styles.previewButtonPressed,
                    ]}
                    hitSlop={8}
                  >
                    <Ionicons
                      name={isPreviewing ? 'stop-circle-outline' : 'play-circle-outline'}
                      size={28}
                      color={theme.colors.primary}
                    />
                  </Pressable>
                </View>
              </Pressable>
            );
          })}

          {voices.length === 0 && (
            <Text style={styles.emptyText}>{t('settings.noVoicesFound')}</Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex:              1,
      backgroundColor:   theme.colors.background,
      paddingTop:        60,
      paddingHorizontal: theme.spacing.screenH,
    },
    centered: {
      flex:           1,
      justifyContent: 'center',
      alignItems:     'center',
    },
    header: {
      flexDirection:  'row',
      alignItems:     'center',
      justifyContent: 'space-between',
      marginBottom:   theme.spacing.sectionGap,
    },
    backButton: {
      padding:      theme.spacing[1.5],
      borderRadius: theme.borderRadius.sm,
    },
    backButtonPressed: {
      backgroundColor: theme.colors.primaryMuted,
    },
    title: {
      ...theme.typography.styles.h3,
      color: theme.colors.text,
    },
    scrollContent: {
      paddingBottom: theme.spacing['2xl'],
      gap:           theme.spacing.sm,
    },
    card: {
      flexDirection:   'row',
      alignItems:      'center',
      justifyContent:  'space-between',
      backgroundColor: theme.colors.surface,
      borderRadius:    theme.borderRadius.md,
      padding:         theme.spacing.md,
      borderWidth:     1,
      borderColor:     'transparent',
    },
    cardSelected: {
      borderColor: theme.colors.primary,
    },
    cardPressed: {
      backgroundColor: theme.colors.primaryMuted,
    },
    cardInfo: {
      flex: 1,
      gap:  2,
    },
    voiceName: {
      ...theme.typography.styles.body,
      color: theme.colors.text,
    },
    voiceNameSelected: {
      color: theme.colors.primary,
    },
    voiceLang: {
      ...theme.typography.styles.caption,
      color: theme.colors.textSecondary,
    },
    cardActions: {
      flexDirection: 'row',
      alignItems:    'center',
      gap:           theme.spacing.sm,
    },
    checkIcon: {
      marginRight: theme.spacing.xs,
    },
    previewButton: {
      padding: theme.spacing[1],
    },
    previewButtonPressed: {
      opacity: 0.6,
    },
    emptyText: {
      ...theme.typography.styles.body,
      color:     theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
    },
  });
