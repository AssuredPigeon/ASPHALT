import { useAuth } from '@/context/AuthContext';
import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import AuthBackground from '../ui/AuthBackground';
import ThemeToggle from './ThemeToggle';
import UserHeader from './UserHeader';

export default function SidebarMenu() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <View style={styles.container}>

      {/* Background decorativo */}
      <AuthBackground />

      {/* Contenido */}
      <View style={styles.content}>
        <UserHeader userName={user?.nombre?.split(' ')[0] ?? undefined} avatarUrl={user?.avatar_url} />


        <View style={styles.divider} />

        <View>
          <Pressable
            style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
            onPress={() => router.navigate('/SettingsScreen')}
          >
            <Ionicons name="settings-outline" size={theme.iconSize.md} color={theme.colors.text} />
            <Text style={styles.option}>{t('sidebar.settings')}</Text>
          </Pressable>
        </View>

        <View style={styles.divider} />

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Ionicons name="moon-outline" size={theme.iconSize.md} color={theme.colors.text} />
            <Text style={styles.option}>{t('sidebar.darkTheme')}</Text>
          </View>
          <ThemeToggle />
        </View>
      </View>

    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      position: 'relative',
    },
    content: {
      flex: 1,
      padding: theme.spacing[7],
      marginTop: theme.spacing[14],
      zIndex: theme.zIndex.raised,
    },
    menuItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3.5],
      paddingVertical: theme.spacing[2],
      paddingHorizontal: theme.spacing[2],
      borderRadius: theme.borderRadius.sm,
    },
    menuItemPressed: {
      backgroundColor: theme.colors.primaryMuted,
    },
    option: {
      ...theme.typography.styles.subtitle,
      color: theme.colors.text,
    },
    toggleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    toggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing[3],
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.sectionGap,
    },
  });