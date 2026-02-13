import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import SettingRow from '../components/ui/SettingRow';
import SettingsSection from '../components/ui/SettingsSection';

export default function SettingsScreen() {
  const [units, setUnits] = useState<'mi' | 'km'>('mi');
  const [mapView, setMapView] = useState<'3d' | '2d'>('3d');
  const [autoFocus, setAutoFocus] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.7);
  const [muteCalls, setMuteCalls] = useState(true);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <Text style={styles.title}>Ajustes</Text>

        {/* Espacio para centrar el título */}
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        <SettingsSection title="General">
          <SettingRow
            label="Unidades de distancia"
            type="segment"
            options={[
              { label: 'Milla', value: 'mi' },
              { label: 'km', value: 'km' }
            ]}
            selected={units}
            onSelect={setUnits}
          />

          <SettingRow label="Idioma" type="arrow" />
        </SettingsSection>

        <SettingsSection title="Mapa">
          <SettingRow
            label="Vista del Mapa"
            type="segment"
            options={[
              { label: '3D', value: '3d' },
              { label: '2D', value: '2d' }
            ]}
            selected={mapView}
            onSelect={setMapView}
          />

          <SettingRow
            label="Auto Enfoque"
            type="switch"
            value={autoFocus}
            onValueChange={setAutoFocus}
          />

          <SettingRow label="Icono del vehículo" type="arrow" />
        </SettingsSection>

        <SettingsSection title="Voz">
          <SettingRow
            label="Volumen de guía de voz"
            type="slider"
            value={voiceVolume}
            onValueChange={setVoiceVolume}
          />

          <SettingRow label="Voz Actual" type="arrow" />

          <SettingRow
            label="Silenciar durante llamadas"
            type="switch"
            value={muteCalls}
            onValueChange={setMuteCalls}
          />
        </SettingsSection>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1E35',
    paddingTop: 60,
    paddingHorizontal: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  backButton: {
    padding: 5,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
});
