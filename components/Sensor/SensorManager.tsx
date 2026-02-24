import * as Location from 'expo-location'; // Importamos el tipo de dato
import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { AcousticSensor } from './AcousticSensor';
import { SensorModule } from './SensorModule';

// Le decimos que va a recibir la ubicación
interface SensorManagerProps {
  location: Location.LocationObject | null;
}

export function SensorManager({ location }: SensorManagerProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Panel de Sensores ASPHALT</Text>
      
      {/* Le pasamos la ubicación a tu sensor para que calcule la velocidad */}
      <SensorModule location={location} />
      
      <AcousticSensor />
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 15,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2c3e50',
  }
});