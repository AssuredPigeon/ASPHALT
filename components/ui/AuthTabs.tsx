import { Pressable, StyleSheet, Text, View } from 'react-native';
{/* Pressable: manejo de estados (lo mejorcito) */}
type Props = {
  active: 'login' | 'register';
  onLoginPress?: () => void;
  onRegisterPress?: () => void;
};

export default function AuthTabs({
  active,
  onLoginPress,
  onRegisterPress,
}: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Pressable
          style={[styles.tab, active === 'login' && styles.activeTab]}
          onPress={onLoginPress}
        >
          <Text style={[styles.text, active === 'login' && styles.activeText]}>
            Inicio Sesión
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, active === 'register' && styles.activeTab]}
          onPress={onRegisterPress}
        >
          <Text style={[styles.text, active === 'register' && styles.activeText]}>
            Registro
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 30,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
  },
  text: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  activeText: {
    color: '#111827',
    fontWeight: '600',
  },
});
