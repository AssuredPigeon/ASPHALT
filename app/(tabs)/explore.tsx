import SidebarMenu from '@/components/ui/SidebarMenu';
import { useTheme } from '@/theme';
import { View } from 'react-native';

export default function ExploreScreen() {
  // useTheme DENTRO del componente, no afuera
  const { theme } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SidebarMenu />
    </View>
  );
}