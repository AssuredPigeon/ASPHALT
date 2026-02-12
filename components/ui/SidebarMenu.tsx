import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import AuthBackground from "../ui/AuthBackground";
import ThemeToggle from "./ThemeToggle";
import UserHeader from "./UserHeader";

export default function SidebarMenu() {
  return (
    <View style={styles.container}>
      
      {/* Background decorativo */}
      <AuthBackground />

      {/* Contenido */}
      <View style={styles.content}>
        <UserHeader />
        {/* Separador */}
        <View style={styles.divider} />

        <View>
          <Pressable style={styles.menuItem} onPress={() => router.push("/")}>
            <Ionicons name="settings-outline" size={20} color="white" />
            <Text style={styles.option}>Ajustes</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Ionicons name="moon-outline" size={20} color="white" />
            <Text style={styles.option}>Tema Oscuro</Text>
          </View>
          <ThemeToggle />
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    position: "relative", 
  },

  content: {
    flex: 1,
    padding: 30,
    marginTop: 60,
    zIndex: 10, // encima
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },

  option: {
    color: "white",
    fontSize: 18,
    fontWeight: "500",
  },

  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  toggleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginVertical: 24,
  },
});
