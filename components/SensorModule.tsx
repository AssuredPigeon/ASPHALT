import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

// CLASE KALMAN - ahora usada para rastrear la LÍNEA BASE (gravedad normal)
// No para suavizar el impacto, sino para saber cuánto se desvía de lo normal.
class KalmanFilter {
  private Q: number;
  private R: number;
  private P: number;
  private X: number;

  constructor(processNoise = 0.1, measurementNoise = 0.1, estimatedError = 1.0) {
    this.Q = processNoise;
    this.R = measurementNoise;
    this.P = estimatedError;
    this.X = 1.0; // FIX: iniciar en 1.0 (gravedad normal) en lugar de 0
  }

  filter(measurement: number) {
    this.P = this.P + this.Q;
    const K = this.P / (this.P + this.R);
    this.X = this.X + K * (measurement - this.X);
    this.P = (1 - K) * this.P;
    return this.X;
  }
}

// FIX: Parámetros ajustados. Q alto = la línea base se adapta lento al terreno.
// R alto = el filtro no confía demasiado en cada lectura individual.
// El resultado: la línea base sigue la gravedad "normal" pero ignora los picos bruscos.
const kalmanBaseline = new KalmanFilter(0.005, 1.5, 1.0);

interface SensorProps {
  location: Location.LocationObject | null;
}

export function SensorModule({ location }: SensorProps) {
  const [{ x, y, z }, setData] = useState({ x: 0, y: 0, z: 0 });
  const [anomalia, setAnomalia] = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [velocidad, setVelocidad] = useState(0);
  const [mensaje, setMensaje] = useState('Escaneando camino...');
  const [severidad, setSeveridad] = useState('Ninguna');

  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // FIX: Usamos refs para leer el estado ACTUAL dentro del callback del acelerómetro.
  // Sin esto, severidad y velocidad siempre valdrían su valor inicial ("Ninguna", 0)
  // porque el listener se registra una sola vez y captura el closure de ese momento.
  const severidadRef = useRef('Ninguna');
  const velocidadRef = useRef(0);

  // Mantener refs sincronizadas con el estado
  useEffect(() => { severidadRef.current = severidad; }, [severidad]);
  useEffect(() => { velocidadRef.current = velocidad; }, [velocidad]);

  // FIX PRINCIPAL: Leer la velocidad del GPS desde el prop `location`.
  // location.coords.speed viene en m/s → lo convertimos a km/h.
  // GPS puede devolver null o -1 cuando no tiene señal suficiente, los tratamos como 0.
  useEffect(() => {
    if (location?.coords.speed != null && location.coords.speed >= 0) {
      setVelocidad(location.coords.speed * 3.6);
    } else {
      setVelocidad(0);
    }
  }, [location]);

  const _subscribe = () => {
    setSubscription(
      Accelerometer.addListener(data => {
        setData(data);

        // Magnitud total del vector G (intensidad del movimiento)
        const rawForce = Math.sqrt(data.x ** 2 + data.y ** 2 + data.z ** 2);

        // FIX: La línea base sigue la "normalidad" (≈1.0G en reposo o carretera lisa).
        // Como Q es bajo y R es alto, el filtro se mueve LENTO y no persigue los picos.
        const baseline = kalmanBaseline.filter(rawForce);

        // FIX: Detectamos anomalías = qué tan por encima de lo normal está la fuerza actual.
        // Ej: rawForce=1.8G, baseline=1.02G → anomalia=0.78G → bache moderado.
        const delta = rawForce - baseline;
        const anomaliaPositiva = Math.max(0, delta);
        setAnomalia(anomaliaPositiva);

        detectarImpacto(anomaliaPositiva);
      })
    );
  };

  const detectarImpacto = (delta: number) => {
    // FIX: Umbrales ahora en términos de DESVIACIÓN sobre la línea base, no fuerza absoluta.
    // Esto funciona sin importar el ángulo en que se sostiene el teléfono.
    const UMBRAL_LEVE     = 0.20; // 0.20G sobre lo normal → irregularidad
    const UMBRAL_MODERADO = 0.45; // 0.45G sobre lo normal → bache
    const UMBRAL_SEVERO   = 0.85; // 0.85G sobre lo normal → impacto fuerte

    // Detectar baches solo cuando el auto va a más de 5 km/h.
    // Esto elimina los falsos positivos cuando estás estacionado o al arrancar.
    const enMovimiento = velocidadRef.current > 5;

    if (enMovimiento) {
      if (delta > UMBRAL_LEVE) {
        if (resetTimer.current) {
          clearTimeout(resetTimer.current);
          resetTimer.current = null;
        }

        if (delta > UMBRAL_SEVERO) {
          setMensaje('¡CRÍTICO!');
          setSeveridad('Severo');
        } else if (delta > UMBRAL_MODERADO) {
          setMensaje('Bache Detectado');
          setSeveridad('Moderado');
        } else {
          setMensaje('Irregularidad');
          setSeveridad('Leve');
        }
      } else {
        // FIX: Ahora lee severidadRef.current (valor actual) en lugar del closure viejo
        if (!resetTimer.current && severidadRef.current !== 'Ninguna') {
          resetTimer.current = setTimeout(() => {
            setMensaje('Escaneando camino...');
            setSeveridad('Ninguna');
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
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.speedPanel}>
        <Text style={styles.speedLabel}>Velocidad GPS</Text>
        <Text style={styles.speedValue}>{velocidad.toFixed(1)} km/h</Text>
      </View>
      <View style={[styles.card, getStyleBySeverity(severidad)]}>
        <Text style={styles.label}>Estado del Camino</Text>
        <Text style={styles.statusText}>{mensaje}</Text>
        {/* Mostramos la anomalía (desviación) en lugar de la fuerza suavizada */}
        <Text style={styles.forceText}>Anomalía G: +{anomalia.toFixed(3)}</Text>
      </View>
      {/* 
      <View style={styles.debug}>
        <Text>Lat: {location?.coords.latitude ?? '...'}</Text>
        <Text>Lon: {location?.coords.longitude ?? '...'}</Text>
        {/* Si este valor siempre es -1 o null, ver nota abajo sobre el padre 
        <Text>GPS speed raw: {location?.coords.speed ?? 'null'} m/s</Text>
      </View>
      */}
    </View>
  );
}

const getStyleBySeverity = (level: string) => {
  switch (level) {
    case 'Severo':   return { backgroundColor: '#ffcdd2', borderColor: 'red',    borderWidth: 2 };
    case 'Moderado': return { backgroundColor: '#fff9c4', borderColor: 'orange', borderWidth: 2 };
    case 'Leve':     return { backgroundColor: '#e1f5fe', borderColor: 'blue',   borderWidth: 1 };
    default:         return { backgroundColor: '#BBC0D5' };
  }
};

const styles = StyleSheet.create({
  container:  { padding: 10, backgroundColor: '#0B2145', borderRadius: 10, marginVertical: 10, width: '100%' },
  speedPanel: { alignItems: 'center', marginBottom: 10 },
  speedLabel: { fontSize: 12, color: '#8BA1C8' },
  speedValue: { fontSize: 24, fontWeight: 'bold', color: '#F4F4F8' },
  card:       { padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2, marginBottom: 10 },
  label:      { fontSize: 14, color: '#444', marginBottom: 5 },
  statusText: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
  forceText:  { fontSize: 14,  fontWeight: 500 ,color: '#1A55B7' },
  debug:      { padding: 5, backgroundColor: '#e0e0e0', borderRadius: 5, opacity: 0.7 },
});