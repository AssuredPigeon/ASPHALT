import { Switch, useColorScheme } from "react-native";

export default function ThemeToggle() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";

  return (
    <Switch
      value={isDark}
      trackColor={{
        false: "#334155", // gris oscuro cuando está apagado
        true: "#2f5b9d",  // azul cuando está activo
      }}
      thumbColor={isDark ? "#ffffff" : "#f1f5f9"}
    />
  );
}
