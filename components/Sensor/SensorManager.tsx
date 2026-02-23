import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { AcousticSensor } from './AcousticSensor';
import { SensorModule } from './SensorModule';

export function SensorManager() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Panel de Sensores ASPHALT</Text>
      
      {/* Aqui se llaman los sensores */}
      <SensorModule />
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
    paddingBottom: 40, // Espacio al final para que no se corte al hacer scroll
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2c3e50',
  }
});