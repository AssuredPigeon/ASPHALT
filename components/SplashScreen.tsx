import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View,
} from 'react-native';
{/* ref para valores persistentes */}

import { Image, ImageBackground } from 'react-native';

{/* Toma las dimensiones de la pantalla */}
const { width, height } = Dimensions.get('window');

{/* Permite q el layout decida q hacer cuando termina */}
type SplashScreenProps = {
    onComplete?: () => void;
};

{/* Componente principal (extrae onComplete desde props) */}
const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    {/* Evitar el reseteo en cada render con ref  */}
    const progress1 = useRef(new Animated.Value(0)).current;
    const progress2 = useRef(new Animated.Value(0)).current; 
    const progress3 = useRef(new Animated.Value(0)).current; 
    const logoOpacity = useRef(new Animated.Value(0)).current; 
    const logoScale = useRef(new Animated.Value(0.8)).current; 
    const textOpacity = useRef(new Animated.Value(0)).current;

    {/* Parellel: Varias animaciones al mismo tiempo 
        timing: Visible a invisble
        .start: espera 500ms y ?. evita errores*/}
    useEffect(() => {
        Animated.sequence([
        Animated.parallel([ 
            Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
            }),
            Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
            }),
        ]),
        Animated.timing(textOpacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }),
        Animated.parallel([
            Animated.timing(progress1, {
            toValue: 1,
            duration: 500,
            useNativeDriver: false,
            }),
            Animated.timing(progress2, {
            toValue: 1,
            duration: 500,
            delay: 150,
            useNativeDriver: false,
            }),
            Animated.timing(progress3, {
            toValue: 1,
            duration: 500,
            delay: 300,
            useNativeDriver: false,
            }),
        ]),
        ]).start(() => {
        setTimeout(() => {
            onComplete?.();
        }, 1500);
        });
    }, []);

    const getLineColor = (progress: Animated.Value) =>
    progress.interpolate({
        inputRange: [0, 1],
        outputRange: ['#FFFFFF', '#FFD400'], // blanco a amarillo
    });


    {/* Renderizado */}
  return (
    <ImageBackground
    source={require('../assets/splash/bg_ss.png')}
    style={styles.container}
    resizeMode="cover"
    imageStyle={{ opacity: 1 }}
    >

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <Image
            source={require('../assets/splash/logo_asp.png')}
            style={styles.logo}
            />
        </View>

        <Text style={styles.logoText}>CARGANDO</Text>
      </Animated.View>

        {/* Barras de progreso */}
      <View style={styles.progressContainer}>
        <Animated.View style={[styles.roadLine, { backgroundColor: getLineColor(progress1) }]} />
        <Animated.View style={[styles.roadLine, { backgroundColor: getLineColor(progress2) }]} />
        <Animated.View style={[styles.roadLine, { backgroundColor: getLineColor(progress3) }]} />
      </View>
    </ImageBackground>
  );
};

{/* Centraliza estilos */}
export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundLines: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  curvedLine: {
    position: 'absolute',
    width: '120%',
    height: 2,
    backgroundColor: '#FFFFFF',
    left: '-10%',
    transform: [{ rotate: '-2deg' }],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 10,
  },
  subtitleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 25,
    position: 'absolute',
    bottom: 100,
  },
  roadLine: {
    width: 60,
    height: 8,
    borderRadius: 4,
  },
});