import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  userName?: string;
};
{/* Aquí va el nombre del usuario, luego conectarlo con el auth */}
export default function UserHeader({ userName = "Ainy" }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar} />

      <View style={styles.textContainer}>
        <Text style={styles.hola}>¡Hola!</Text>

        <Text style={styles.name}>
          Viajero <Text style={styles.userName}>{userName}</Text>
        </Text>

        <Pressable onPress={() => router.push("/")}>
          <Text style={styles.link}>Ver perfil</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 29,
    backgroundColor: "#2f5b9d",
  },

  textContainer: {
    justifyContent: "center",
  },

  hola: {
    color: "white",
    fontSize: 18,
    opacity: 0.8,
  },

  name: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
  },

  userName: {
    color: "#7FA3E2",
    fontSize: 24,
    fontWeight: "700",
  },

  link: {
    color: "#2f5b9d",
    fontSize: 16,
    marginTop: 4,
  },
});
