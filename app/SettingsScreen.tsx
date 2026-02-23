import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import SettingRow from '@/components/ui/SettingRow';
import SettingsSection from '@/components/ui/SettingsSection';

export default function SettingsScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { t } = useTranslation();

  const [units,       setUnits]       = useState<'mi' | 'km'>('mi');
  const [mapView,     setMapView]     = useState<'3d' | '2d'>('3d');
  const [autoFocus,   setAutoFocus]   = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.7);
  const [muteCalls,   setMuteCalls]   = useState(true);

  return (
    <View style={styles.container}>

      {/* ── Header ── */}
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
            onSelect={setUnits}
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
              { label: '3D', value: '3d' },
              { label: '2D', value: '2d' },
            ]}
            selected={mapView}
            onSelect={setMapView}
          />
          <View style={styles.rowDivider} />
          <SettingRow
            label={t('settings.autoFocus')}
            type="switch"
            value={autoFocus}
            onValueChange={setAutoFocus}
          />
          <View style={styles.rowDivider} />
          <SettingRow label={t('settings.vehicleIcon')} type="arrow" />
        </SettingsSection>

        <SettingsSection title={t('settings.voice')}>
          <SettingRow
            label={t('settings.voiceVolume')}
            type="slider"
            value={voiceVolume}
            onValueChange={setVoiceVolume}
          />
          <View style={styles.rowDivider} />
          <SettingRow label={t('settings.currentVoice')} type="arrow" />
          <View style={styles.rowDivider} />
          <SettingRow
            label={t('settings.muteCalls')}
            type="switch"
            value={muteCalls}
            onValueChange={setMuteCalls}
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
      height:          1,
      backgroundColor: theme.colors.divider,
      marginHorizontal: theme.spacing.md,
    },
  });