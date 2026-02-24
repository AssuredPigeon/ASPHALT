import { lightTheme } from '@/theme/light';
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const { colors } = lightTheme;

// label es opcional: si no se pasa, usa la traducción por defecto
export default function SocialAuth({ label }: { label?: string }) {
  const { t } = useTranslation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:     process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    iosClientId:     process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!,
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("TOKEN:", authentication);
    }
  }, [response]);

  return (
    <>
      {/* Si viene prop la usa, si no usa la traducción */}
      <Text style={styles.divider}>{label ?? t('socialAuth.label')}</Text>

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
    textAlign:      'center',
    fontSize:       12,
    color:          colors.textTertiary,
  },
  row: {
    flexDirection: 'row',
    gap:           12,
  },
  social: {
    flex:            1,
    borderWidth:     1,
    borderColor:     colors.border,
    borderRadius:    12,
    paddingVertical: 12,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: colors.surface,
  },
  icon: {
    width:      22,
    height:     22,
    resizeMode: 'contain',
  },
});