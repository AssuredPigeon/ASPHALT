import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

type Props = {
  onActivate: () => void; // Función que se llama al presionar la barra
};

export default function SearchBar({ onActivate }: Props) {
  return (
    <Pressable onPress={onActivate} style={styles.pressable}>
      <View style={styles.container}>
        <Ionicons name="search" size={20} color="#F4F4F8" />
        <TextInput
          placeholder="Buscar ubicación"
          placeholderTextColor="#F4F4F8"
          style={styles.input}
          editable={false} // No editable, actúa como botón
          pointerEvents="none" // Evita que el TextInput capture toques
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    position: 'absolute',
    top: 60, // Ajusta según tu barra de estado
    left: 20,
    right: 20,
    zIndex: 10, // Para que esté sobre el mapa
  },
  container: {
    backgroundColor: '#152D5C',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 45,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // Para Android
  },
  input: {
    marginLeft: 10,
    color: '#e9e5e5', // Cambiado de blanco a oscuro para verse
    flex: 1,
  },
});
