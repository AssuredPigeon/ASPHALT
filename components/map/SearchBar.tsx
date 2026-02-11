import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

type Props = {
  onActivate: () => void;
};

export default function SearchBar({ onActivate }: Props) {
  return (
    <Pressable onPressIn={onActivate}>
      <View style={styles.container}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          placeholder="Buscar ubicación"
          placeholderTextColor="#666"
          style={styles.input}
          editable={false}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#F4F4F8',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 45,
  },
  input: {
    marginLeft: 10,
    color: '#fff',
    flex: 1,
  },
});
