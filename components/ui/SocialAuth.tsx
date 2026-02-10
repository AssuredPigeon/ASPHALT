import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

export default function SocialAuth() {
  return (
    <>
      <Text style={styles.divider}>O regístrate con</Text>

      <View style={styles.row}>
        <Pressable style={styles.social}>
          <Image
            source={require('../../assets/icons/logo_google.png')}
            style={styles.icon}
          />
        </Pressable>

        <Pressable style={styles.social}>
          <Image
            source={require('../../assets/icons/logo_face.png')}
            style={styles.icon}
          />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    marginVertical: 16,
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  social: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
});
