import { useTheme } from '@/theme';
import { Switch } from 'react-native';

export default function ThemeToggle() {
  const { isDark, toggleTheme, theme } = useTheme();

  return (
    <Switch
      value={isDark}
      onValueChange={toggleTheme}
      trackColor={{
        false: theme.colors.surfaceSecondary,
        true:  theme.colors.primary,
      }}
      thumbColor={isDark ? theme.colors.text : theme.colors.textSecondary}
      ios_backgroundColor={theme.colors.surfaceSecondary}
    />
  );
}