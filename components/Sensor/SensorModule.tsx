import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// CLASE KALMAN PARA SUAVIZAR EL ACELEROMETRO
class KalmanFilter {
  constructor(processNoise = 0.1, measurementNoise = 0.1, estimatedError = 0.1) {
    this.Q = processNoise;
    this.R = measurementNoise;
    this.P = estimatedError;
    this.X = 0; 
  }
  filter(measurement: number) 
  // Prediccion y correccion del error
  {
    this.P = this.P + this.Q;
    const K = this.P / (this.P + this.R);
    this.X = this.X + K * (measurement - this.X);
    this.P = (1 - K) * this.P;
    return this.X;
  }
}
// Instancia global del filtro para mantener el estado entre renders
const kalman = new KalmanFilter(0.01, 0.1);

export function SensorModule() {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [fuerzaSuavizada, setFuerzaSuavizada] = useState(1.0);
  const [subscription, setSubscription] = useState<any>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [velocidad, setVelocidad] = useState(0);
  const [mensaje, setMensaje] = useState("Escaneando camino...");
  const [severidad, setSeveridad] = useState("Ninguna");
// Timer para borrar la alerta despues de unos segundos
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

// Gestion del GPS
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 10 },
        (loc) =>  {
            setLocation(loc);
            let speedKmh = (loc.coords.speed || 0) * 3.6; // Conversion: m/s * 3.6 = km/h
            // "zona muerta" ignoramos movimientos menores a 2km/h (ruido de GPS parado)
            if (speedKmh < 2.0) speedKmh = 0;
            setVelocidad(speedKmh);
        }
      );
    })();
  }, []);

// Gestion del acelerometro 
  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(data => {
        setData(data);
        // Calcula la magnitud total de la fuerza (Vector G)
        // ignora la direccion, solo nos importa la intensidad del golpe.
        const rawForce = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);
        // Se pasa el dato crudo por el filtro para quitar "ruido"
        const smoothForce = kalman.filter(rawForce);
        setFuerzaSuavizada(smoothForce);
        detectarImpacto(smoothForce);
      })
    );
  };

// Logica de deteccion de baches e irregularidades
  const detectarImpacto = (fuerza: number) => {
    // Umbrales de fuerza G (1.0 G es la gravedad normal en reposo)
    const UMBRAL_LEVE = 1.2;
    const UMBRAL_MODERADO = 1.5;
    const UMBRAL_SEVERO = 2.0;

    // Quitar "|| true" cuando se quiera probrrar en un carro real
    const enMovimiento = velocidad > 5 || true; 

    if (enMovimiento) {
        if (fuerza > UMBRAL_LEVE) {
            // Si hay un nuevo impacto, cancelamos el timer de "limpieza" anterior
            if (resetTimer.current) {
                clearTimeout(resetTimer.current);
                resetTimer.current = null;
            }
            // Clasificacion del impacto
            if (fuerza > UMBRAL_SEVERO) {
                setMensaje("¡CRITICO!");
                setSeveridad("Severo");
            } else if (fuerza > UMBRAL_MODERADO) {
                setMensaje("Bache Detectado");
                setSeveridad("Moderado");
            } else {
                setMensaje("Irregularidad");
                setSeveridad("Leve");
            }
        } else {
            // Si la fuerza vuelve a la normalidad y NO hay un timer corriendo...
            if (!resetTimer.current && severidad !== "Ninguna") {
                // Se espera 1.5s antes de volver a decir "Escaneando" para que el usuario pueda leer
                resetTimer.current = setTimeout(() => {
                    setMensaje("Escaneando camino...");
                    setSeveridad("Ninguna");
                    resetTimer.current = null;
                }, 1500);
            }
        }
    }
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    Accelerometer.setUpdateInterval(100);
    return () => _unsubscribe();
  }, [velocidad, severidad]);

  return (
    <View style={styles.container}>
      <View style={styles.speedPanel}>
        <Text style={styles.speedLabel}>Velocidad GPS</Text>
        <Text style={styles.speedValue}>{velocidad.toFixed(1)} km/h</Text>
      </View>
      <View style={[styles.card, getStyleBySeverity(severidad)]}>
        <Text style={styles.label}>Estado del Camino</Text>
        <Text style={styles.statusText}>{mensaje}</Text>
        <Text style={styles.forceText}>Fuerza G: {fuerzaSuavizada.toFixed(3)}</Text>
      </View>
      <View style={styles.debug}>
        <Text>Lat: {location?.coords.latitude || '...'}</Text>
        <Text>Lon: {location?.coords.longitude || '...'}</Text>
      </View>
    </View>
  );
}

const getStyleBySeverity = (level: string) => {
    switch(level) {
        case 'Severo': return { backgroundColor: '#ffcdd2', borderColor: 'red', borderWidth: 2 };
        case 'Moderado': return { backgroundColor: '#fff9c4', borderColor: 'orange', borderWidth: 2 };
        case 'Leve': return { backgroundColor: '#e1f5fe', borderColor: 'blue', borderWidth: 1 };
        default: return { backgroundColor: 'white' };
    }
};

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: '#f0f0f0', borderRadius: 10, marginVertical: 10, width: '100%' },
  speedPanel: { alignItems: 'center', marginBottom: 10 },
  speedLabel: { fontSize: 12, color: '#666' },
  speedValue: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  card: { padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2, marginBottom: 10 },
  label: { fontSize: 14, color: '#555', marginBottom: 5 },
  statusText: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  forceText: { fontSize: 14, color: '#444' },
  debug: { padding: 5, backgroundColor: '#e0e0e0', borderRadius: 5, opacity: 0.7 }
});