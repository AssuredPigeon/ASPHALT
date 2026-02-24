import AuthBackground from "@/components/ui/AuthBackground";
import AuthButton from "@/components/ui/AuthButton";
import AuthInput from "@/components/ui/AuthInput";
import AuthTabs from "@/components/ui/AuthTabs";
import GuestButton from "@/components/ui/GuestButton";
import SocialAuth from "@/components/ui/SocialAuth";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const { t } = useTranslation(); 

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID!,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID!
  });

  useEffect(() => {
    if (response?.type !== "success") return;

    const sendGoogleToken = async () => {
      const { authentication } = response;

      if (!authentication?.idToken) return;

      try {
        const res = await api.post("/auth/google", {
          id_token: authentication.idToken,
        });

        const { token, refreshToken } = res?.data || {};

        if (token) {
          await login(token, refreshToken);
          router.replace("/(tabs)");
        }
      } catch (error) {
        console.error("Error Google login:", error);
        Alert.alert("Error", t('auth.errors.googleError'));
      }
    };

    sendGoogleToken();
  }, [response, router]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", t('auth.errors.fillFields'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", t('auth.errors.invalidEmail'));
      return;
    }

    if (password.length < 8) {
      Alert.alert("Error", t('auth.errors.shortPassword'));
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data);

      const { accessToken, refreshToken } = res?.data || {};
      console.log("TOKEN:", accessToken);
      console.log("REFRESH TOKEN:", refreshToken);

      if (accessToken) {
        try {
          await login(accessToken, refreshToken);
          console.log("LOGIN EXITOSO, redirigiendo...");
          router.replace("/(tabs)");
        } catch (err) {
          console.error("ERROR en login():", err);
        }
      }
    } catch (error: any) {
      Alert.alert(
        "Error",
        error?.response?.data?.message || t('auth.errors.wrongCredentials'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AuthBackground />

      <Image
        source={require("../../assets/images/Logo_A.png")}
        style={styles.logo}
      />

      <Text style={styles.subtitle}>{t('auth.subtitle')}</Text>

      <View style={styles.card}>
        <AuthTabs
          active="login"
          onRegisterPress={() => router.push("/register")}
        />

        <AuthInput
          icon="mail-outline"
          placeholder={t('auth.emailPlaceholder')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View style={{ position: "relative" }}>
          <AuthInput
            icon="lock-closed-outline"
            placeholder={t('auth.passwordPlaceholder')}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 15,
              top: 18,
            }}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color="#64748B"
            />
          </Pressable>
        </View>

        <Pressable
          onPress={() => setRememberMe(!rememberMe)}
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
        >
          <Ionicons
            name={rememberMe ? "checkbox" : "square-outline"}
            size={20}
            color={rememberMe ? "#1E5EFF" : "#64748B"}
          />

          <Text style={{ marginLeft: 8, fontSize: 13, color: "#334155" }}>
            {t('auth.rememberMe')}
          </Text>
        </Pressable>

        <AuthButton
          label={loading ? t('auth.loggingIn') : t('auth.loginButton')}
          onPress={handleLogin}
        />

        <Pressable onPress={() => router.push("/recoverPassword")}>
          <Text style={[styles.helper]}>{t('auth.forgotPassword')}</Text>
        </Pressable>

        <GuestButton />

        <SocialAuth />

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    alignItems: "center",
    paddingTop: 80,
  },
  logo: {
    width: 260,
    height: 140,
    resizeMode: "contain",
    marginBottom: 10,
  },
  subtitle: {
    color: "#CBD5E1",
    textAlign: "center",
    marginBottom: 30,
  },
  card: {
    backgroundColor: "#FFFFFF",
    width: "90%",
    borderRadius: 24,
    padding: 20,
  },
  helper: {
    marginTop: 12,
    fontSize: 12,
    color: "#1E5EFF",
    textAlign: "right",
  },
});