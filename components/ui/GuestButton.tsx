import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function GuestButton() {
  return (
    <Pressable style={styles.button}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/icons/user.png')}
          style={styles.icon}
        />
        <Text style={styles.text}>Invitado</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
    marginRight: 8,
  },
  text: {
    color: '#111827',
    fontWeight: '500',
  },
});
