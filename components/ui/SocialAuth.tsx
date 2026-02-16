import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export default function SocialAuth({ label = 'O regístrate con' }: { label?: string }) {
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("TOKEN:", authentication);
    }
  }, [response]);

  return (
    <>
      <Text style={styles.divider}>{label}</Text>

      <View style={styles.row}>
        <Pressable
          style={styles.social}
          disabled={!request}
          onPress={() => promptAsync()}
        >
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
