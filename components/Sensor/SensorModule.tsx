import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

// Kalman Filter
// Rastrea la LÍNEA BASE (gravedad normal) para detectar desviaciones.
class KalmanFilter {
  private Q: number;
  private R: number;
  private P: number;
  private X: number;

  constructor(processNoise = 0.1, measurementNoise = 0.1, estimatedError = 1.0) {
    this.Q = processNoise;
    this.R = measurementNoise;
    this.P = estimatedError;
    this.X = 1.0; // Iniciar en 1.0G (gravedad normal en reposo)
  }

  filter(measurement: number) {
    this.P = this.P + this.Q;
    const K = this.P / (this.P + this.R);
    this.X = this.X + K * (measurement - this.X);
    this.P = (1 - K) * this.P;
    return this.X;
  }
}

// Q bajo → línea base se adapta lento (ignora picos bruscos)
// R alto → no confía demasiado en cada lectura individual
const kalmanBaseline = new KalmanFilter(0.005, 1.5, 1.0);

// Tipos de severidad
type Severidad = 'Ninguna' | 'Leve' | 'Moderado' | 'Severo';

interface SensorProps {
  location: Location.LocationObject | null;
}

// Color del punto de estado según severidad
const getDotColor = (level: Severidad, theme: AppTheme) => {
  switch (level) {
    case 'Severo':   return theme.colors.error;
    case 'Moderado': return theme.colors.warning;
    case 'Leve':     return theme.colors.success;
    default:         return theme.colors.textSecondary;
  }
};

// Componente
export function SensorModule({ location }: SensorProps) {
  const { theme } = useTheme();
  const styles    = makeStyles(theme);
  const { t }     = useTranslation();

  const [{ x, y, z }, setData]          = useState({ x: 0, y: 0, z: 0 });
  const [anomalia,    setAnomalia]       = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [velocidad,   setVelocidad]     = useState(0);
  const [mensaje,     setMensaje]       = useState<string>('scanning');
  const [severidad,   setSeveridad]     = useState<Severidad>('Ninguna');

  const resetTimer   = useRef<ReturnType<typeof setTimeout> | null>(null);

  {/* Usamos refs para leer el estado ACTUAL dentro del callback del acelerómetro.
   Sin esto, severidad y velocidad siempre valdrían su valor inicial ("Ninguna", 0)
   porque el listener se registra una sola vez y captura el closure de ese momento. */}
  const severidadRef = useRef<Severidad>('Ninguna');
  const velocidadRef = useRef(0);

  // Mantener refs sincronizadas con estado
  useEffect(() => { severidadRef.current = severidad; }, [severidad]);
  useEffect(() => { velocidadRef.current = velocidad; }, [velocidad]);

  // Velocidad desde GPS (m/s → km/h)
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
        {/*
         La línea base sigue la "normalidad" (≈1.0G en reposo o carretera lisa).
         Como Q es bajo y R es alto, el filtro se mueve LENTO y no persigue los picos.*/}
        const baseline = kalmanBaseline.filter(rawForce);

        // Ej: rawForce=1.8G, baseline=1.02G → anomalia=0.78G → bache moderado.
        const delta            = rawForce - baseline;
        const anomaliaPositiva = Math.max(0, delta);

        setAnomalia(anomaliaPositiva);
        detectarImpacto(anomaliaPositiva);
      })
    );
  };

  const detectarImpacto = (delta: number) => {
    const UMBRAL_LEVE     = 0.20;
    const UMBRAL_MODERADO = 0.45;
    const UMBRAL_SEVERO   = 0.85;

    // Detectar baches solo cuando el auto va a más de 5 km/h.
    const enMovimiento = velocidadRef.current > 5;

    if (enMovimiento) {
      if (delta > UMBRAL_LEVE) {
        if (resetTimer.current) {
          clearTimeout(resetTimer.current);
          resetTimer.current = null;
        }

        if (delta > UMBRAL_SEVERO) {
          setMensaje('critical');
          setSeveridad('Severo');
        } else if (delta > UMBRAL_MODERADO) {
          setMensaje('pothole');
          setSeveridad('Moderado');
        } else {
          setMensaje('irregularity');
          setSeveridad('Leve');
        }
      } else {
        if (!resetTimer.current && severidadRef.current !== 'Ninguna') {
          resetTimer.current = setTimeout(() => {
            setMensaje('scanning');
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
    // Todo en una sola fila horizontal para ocupar el mínimo espacio posible
    <View style={styles.container}>

      {/* Punto de color que indica la severidad actual */}
      <View style={[styles.dot, { backgroundColor: getDotColor(severidad, theme) }]} />

      {/* Velocidad compacta */}
      <Text style={styles.speed}>{velocidad.toFixed(1)} <Text style={styles.unit}>km/h</Text></Text>

      {/* Separador visual */}
      <View style={styles.divider} />

      {/* Estado del camino + anomalía G */}
      <Text style={styles.status} numberOfLines={1}>{t(`sensor.${mensaje}`)}</Text>
      <Text style={styles.anomaly}>+{anomalia.toFixed(2)}G</Text>

    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flexDirection:     'row',       // Una sola fila horizontal
      alignItems:        'center',
      paddingHorizontal: theme.spacing[4],
      paddingVertical:   theme.spacing[3.5], // Más cuerpo vertical
      backgroundColor:   theme.colors.surface,
      borderRadius:      theme.borderRadius.md,
      borderWidth:       1,
      borderColor:       theme.colors.border,
      gap:               theme.spacing[3],
      ...theme.shadows.sm,
    },
    dot: {
      width:        10,
      height:       10,
      borderRadius: 5, // Círculo de estado: gris=ok, verde=leve, naranja=moderado, rojo=severo
    },
    speed: {
      ...theme.typography.styles.h3,  // Más grande que label
      color:       theme.colors.text,
      fontVariant: ['tabular-nums'],
    },
    unit: {
      ...theme.typography.styles.label,
      color: theme.colors.textSecondary,
    },
    divider: {
      width:           1,
      height:          18,
      backgroundColor: theme.colors.divider,
    },
    status: {
      flex:    1,       // Ocupa el espacio sobrante
      ...theme.typography.styles.label,
      color:   theme.colors.textSecondary,
    },
    anomaly: {
      ...theme.typography.styles.label,
      color:       theme.colors.primary,
      fontVariant: ['tabular-nums'],
    },
  });