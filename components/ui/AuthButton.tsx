import { lightTheme } from '@/theme/light';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress?: () => void;
};

export default function AuthButton({ label, onPress }: Props) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

const { colors } = lightTheme;

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    height:          48,
    borderRadius:    24,
    alignItems:      'center',
    justifyContent:  'center',
    marginTop:       10,
  },
  text: {
    color:      colors.textInverse,
    fontSize:   16,
    fontWeight: '600',
  },
});