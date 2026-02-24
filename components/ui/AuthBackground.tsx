import { StyleSheet, View } from 'react-native';

export default function AuthBackground() {
  return (
    <>
      <View style={[styles.circle, styles.topRight]} />
      <View style={[styles.circle, styles.topLeft]} />
      <View style={[styles.circle, styles.bottom]} />
    </>
  );
}

const styles = StyleSheet.create({
  circle: {
    position: 'absolute', // posición libre
    borderRadius: 999, // los hace perfecto
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.3)',
  },
  topRight: {
    width: 260,
    height: 260,
    top: -80,
    right: -80,
  },
  topLeft: {
    width: 180,
    height: 180,
    top: 120,
    left: -90,
  },
  bottom: {
    width: 300,
    height: 300,
    bottom: -140,
    left: -100,
  },
});
