import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

export function AcousticSensor() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [metering, setMetering] = useState<number>(-160);
  
  // estado para bloquear el boton mientras el telefono "piensa"
  const [isProcessing, setIsProcessing] = useState(false); 

  useEffect(() => {
    return () => {
      if (recording) {
        // Un catch silencioso por si la app se cierra de golpe
        recording.stopAndUnloadAsync().catch(() => {}); 
      }
    };
  }, [recording]);

  async function startRecording() {
    if (isProcessing) return; // Si ya esta cargando, ignora clics extra
    setIsProcessing(true);
    
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Solicitando permiso para el microfono.');
        await requestPermission();
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Iniciando grabacion.');
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording && status.metering) {
            setMetering(status.metering);
          }
        },
        100
      );

      setRecording(newRecording);
      console.log('Grabacion iniciada correctamente');
    } catch (err) {
      console.error('Fallo al iniciar la grabacion', err);
    } finally {
      setIsProcessing(false); // Liberar el boton
    }
  }

  async function stopRecording() {
    if (!recording || isProcessing) return;
    setIsProcessing(true);
    console.log('Deteniendo grabación...');
    
    try {
      const currentRecording = recording; // Guardamos la referencia
      setRecording(null); // Actualizamos la UI inmediatamente a verde
      
      await currentRecording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      
      console.log('Grabacion detenida');
    } catch (error) {
      console.log('Ignorado: El sensor ya estaba detenido', error);
    } finally {
      setIsProcessing(false);
      setMetering(-160); // Regresamos el medidor a cero (silencio)
    }
  }

  const volumePercentage = Math.max(0, 100 + metering);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sensor Acústico (Pavimento)</Text>
      
      <View style={styles.meterContainer}>
        <Text style={styles.meterText}>Nivel de Ruido: {metering.toFixed(2)} dB</Text>
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: `${volumePercentage}%` }]} />
        </View>
      </View>

      {/* Si esta procesando, muestra un icono de carga. Si no, muestra el boton */}
      {isProcessing ? (
        <ActivityIndicator size="large" color="#3498db" />
      ) : (
        <Button
          title={recording ? 'Detener Analisis' : 'Iniciar Analisis de Ruido'}
          onPress={recording ? stopRecording : startRecording}
          color={recording ? 'red' : 'green'}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: '#fff', borderRadius: 10, marginVertical: 10, width: '100%', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#333' },
  meterContainer: { marginVertical: 15 },
  meterText: { fontSize: 16, marginBottom: 5, color: '#555' },
  barBackground: { height: 20, backgroundColor: '#eee', borderRadius: 10, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#3498db' },
});