import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import SettingRow from '@/components/ui/SettingRow';
import SettingsSection from '@/components/ui/SettingsSection';
import { useAppSettings } from '../context/AppSettingsContext';
import { useMapSettings } from '../context/MapSettingsContext';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { t } = useTranslation();

  // mapView viene del contexto compartido para que AsphaltMap reaccione al cambio
  const { mapView, setMapView } = useMapSettings();

  // el resto de settings vienen del contexto unificado, persisten en AsyncStorage
  const {
    units,
    autoFocus,
    voiceVolume,
    muteCalls,
    setSetting,
    isLoaded,
  } = useAppSettings();

  // loader mínimo mientras AsyncStorage hidrata
  if (!isLoaded) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </Pressable>

        <Text style={styles.title}>{t('settings.title')}</Text>

        {/* Spacer para centrar título */}
        <View style={{ width: 34 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        <SettingsSection title={t('settings.general')}>
          <SettingRow
            label={t('settings.distanceUnits')}
            type="segment"
            options={[
              { label: t('settings.mile'), value: 'mi' },
              { label: t('settings.km'),   value: 'km' },
            ]}
            selected={units}
            onSelect={(v) => setSetting('units', v as 'mi' | 'km')}
          />
          <View style={styles.rowDivider} />
          <Pressable onPress={() => router.push('/LanguageScreen' as any)}>
            <SettingRow
              label={t('settings.language')}
              type="arrow"
            />
          </Pressable>
        </SettingsSection>

        <SettingsSection title={t('settings.map')}>
          <SettingRow
            label={t('settings.mapView')}
            type="segment"
            options={[
              { label: '2D', value: '2d' },
              { label: '3D', value: '3d' },
            ]}
            selected={mapView}
            onSelect={setMapView}   // escribe directo al contexto, AsphaltMap lo lee
          />
          <View style={styles.rowDivider} />
          <SettingRow
            label={t('settings.autoFocus')}
            type="switch"
            value={autoFocus}
            onValueChange={(v) => setSetting('autoFocus', v)}
          />
          <View style={styles.rowDivider} />
          <Pressable onPress={() => router.push('/VehicleIconScreen' as any)}>
            <SettingRow label={t('settings.vehicleIcon')} type="arrow" />
          </Pressable>
        </SettingsSection>

        <SettingsSection title={t('settings.voice')}>
          <SettingRow
            label={t('settings.voiceVolume')}
            type="slider"
            value={voiceVolume}
            onValueChange={(v) => setSetting('voiceVolume', v)}
          />
          <View style={styles.rowDivider} />
          <Pressable onPress={() => router.push('/VoiceScreen' as any)}>
            <SettingRow label={t('settings.currentVoice')} type="arrow" />
          </Pressable>
          <View style={styles.rowDivider} />
          <SettingRow
            label={t('settings.muteCalls')}
            type="switch"
            value={muteCalls}
            onValueChange={(v) => setSetting('muteCalls', v)}
          />
        </SettingsSection>

      </ScrollView>
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
    },
    rowDivider: {
      height:           1,
      backgroundColor:  theme.colors.divider,
      marginHorizontal: theme.spacing.md,
    },
  });
