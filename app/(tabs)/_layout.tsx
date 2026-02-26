import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDrivingMode } from '../../context/DrivingModeContext';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t }     = useTranslation();

  // Ocultar la tab bar durante el modo conducción para pantalla limpia
  const { isDriving } = useDrivingMode();

  return (
    <Tabs
      screenOptions={{
        headerShown:             false,
        tabBarActiveTintColor:   theme.colors.tabActive,
        tabBarInactiveTintColor: theme.colors.tabInactive,
        tabBarStyle: isDriving
          // Modo conducción: ocultar completamente la tab bar
          ? { display: 'none' }
          // Normal: estilos habituales
          : {
              backgroundColor: theme.colors.navBackground,
              borderTopWidth:  1,
              borderTopColor:  theme.colors.navBorder,
              elevation:       0,
              height:          85,
              paddingBottom:   15,
            },
        tabBarLabelStyle: {
          ...theme.typography.styles.label,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.map'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: t('tabs.menu'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}