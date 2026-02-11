import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
  onClose: () => void;
};

export default function BottomActions({ onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(80)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {['Casa', 'Trabajo', 'Universidad'].map(btn => (
        <TouchableOpacity key={btn} style={styles.button}>
          <Text style={styles.text}>{btn}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity onPress={onClose}>
        <Text style={{ color: '#fff', marginTop: 10 }}>Cerrar</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#5d77a3',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});
