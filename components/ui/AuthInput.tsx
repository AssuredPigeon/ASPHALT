import { lightTheme } from '@/theme/light';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';

{/* Icon: nombre del ícono de Ionicons
  hereda todas las props normales de TextInput */}
type Props = {
  icon: keyof typeof Ionicons.glyphMap;
} & TextInputProps;

const { colors } = lightTheme;

export default function AuthInput({ icon, ...inputProps }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={18} color={colors.inputPlaceholder} />
      <TextInput
        placeholderTextColor={colors.inputPlaceholder}
        style={styles.input}
        {...inputProps}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:     'row',
    alignItems:        'center',
    borderWidth:       1,
    borderColor:       colors.inputBorder,
    borderRadius:      12,
    paddingHorizontal: 12,
    height:            48,
    marginBottom:      12,
    backgroundColor:   colors.inputBackground,
  },
  input: {
    flex:       1, // Ocipa todo el espacio restante
    marginLeft: 10,
    fontSize:   14,
    color:      colors.text,
  },
});