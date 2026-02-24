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

//  Tipos de severidad 
type Severidad = 'Ninguna' | 'Leve' | 'Moderado' | 'Severo';

interface SensorProps {
  location: Location.LocationObject | null;
}

//  Colores por severidad usando tokens del tema 
const getSeverityStyles = (level: Severidad, theme: AppTheme) => {
  switch (level) {
    case 'Severo':
      return {
        backgroundColor: theme.colors.errorMuted,
        borderColor:     theme.colors.error,
        borderWidth:     2,
      };
    case 'Moderado':
      return {
        backgroundColor: theme.colors.warningMuted,
        borderColor:     theme.colors.warning,
        borderWidth:     2,
      };
    case 'Leve':
      return {
        backgroundColor: theme.colors.successMuted,
        borderColor:     theme.colors.success,
        borderWidth:     1,
      };
    default:
      return {
        backgroundColor: theme.colors.surface,
        borderWidth:     0,
      };
  }
};

//  Componente 
export function SensorModule({ location }: SensorProps) {
  const { theme } = useTheme();
  const styles    = makeStyles(theme);
  const { t }     = useTranslation();

  const [{ x, y, z }, setData]     = useState({ x: 0, y: 0, z: 0 });
  const [anomalia,    setAnomalia]  = useState(0);
  const [subscription, setSubscription] = useState<any>(null);
  const [velocidad,   setVelocidad] = useState(0);
  const [mensaje,     setMensaje]   = useState<string>('scanning');
  const [severidad,   setSeveridad] = useState<Severidad>('Ninguna');

  const resetTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);

  {/* Usamos refs para leer el estado ACTUAL dentro del callback del acelerómetro.
   Sin esto, severidad y velocidad siempre valdrían su valor inicial ("Ninguna", 0)
   porque el listener se registra una sola vez y captura el closure de ese momento. */}
  const severidadRef  = useRef<Severidad>('Ninguna');
  const velocidadRef  = useRef(0);

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
        const delta    = rawForce - baseline;
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

  const severityStyles = getSeverityStyles(severidad, theme);

  return (
    <View style={styles.container}>

      {/* Panel de velocidad */}
      <View style={styles.speedPanel}>
        <Text style={styles.speedLabel}>{t('sensor.speedLabel')}</Text>
        <Text style={styles.speedValue}>{velocidad.toFixed(1)} km/h</Text>
      </View>

      {/* Tarjeta de estado */}
      <View style={[styles.card, severityStyles]}>
        <Text style={styles.cardLabel}>{t('sensor.roadStatus')}</Text>
        <Text style={[
          styles.statusText,
          severidad === 'Severo'   && { color: theme.colors.error   },
          severidad === 'Moderado' && { color: theme.colors.warning  },
          severidad === 'Leve'     && { color: theme.colors.success  },
          severidad === 'Ninguna'  && { color: theme.colors.text     },
        ]}>
          {t(`sensor.${mensaje}`)}
        </Text>
        <Text style={styles.forceText}>
          {t('sensor.anomaly')} +{anomalia.toFixed(3)}
        </Text>
      </View>

    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      padding:         theme.spacing[2.5],
      backgroundColor: theme.colors.surface,
      borderRadius:    theme.borderRadius.md,
      marginVertical:  theme.spacing[2.5],
      width:           '100%',
      borderWidth:     1,
      borderColor:     theme.colors.border,
      ...theme.shadows.lg,
    },
    speedPanel: {
      alignItems:    'center',
      marginBottom:  theme.spacing[2.5],
      paddingBottom: theme.spacing[2.5],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.divider,
    },
    speedLabel: {
      ...theme.typography.styles.label,
      color: theme.colors.textSecondary,
    },
    speedValue: {
      ...theme.typography.styles.h2,
      color: theme.colors.text,
    },
    card: {
      padding:       theme.spacing[3.5],
      borderRadius:  theme.borderRadius.sm,
      alignItems:    'center',
      marginBottom:  theme.spacing[2.5],
      ...theme.shadows.sm,
    },
    cardLabel: {
      ...theme.typography.styles.label,
      color:        theme.colors.textSecondary,
      marginBottom: theme.spacing[1],
    },
    statusText: {
      ...theme.typography.styles.h3,
      marginBottom: theme.spacing[1],
      textAlign:    'center',
    },
    forceText: {
      ...theme.typography.styles.captionMedium,
      color: theme.colors.primary,
    },
  });