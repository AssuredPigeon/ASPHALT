import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, View } from 'react-native';

import { TextInputProps } from 'react-native';

{/* Icon: nombre del ícono de Ionicons
  hereda todas las props normales de TextInput */}
type Props = {
  icon: keyof typeof Ionicons.glyphMap;
} & TextInputProps;

export default function AuthInput({ icon, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={18} color="#9CA3AF" />
      <TextInput
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
  },
  input: {
    flex: 1, // Ocipa todo el espacio restante
    marginLeft: 10,
    fontSize: 14,
  },
});
