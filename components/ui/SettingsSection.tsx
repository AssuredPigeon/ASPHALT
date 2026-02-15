import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title:    string;
  children: React.ReactNode; // representa lo q colocas dentro del componente.
};

// wrapper
export default function SettingsSection({ title, children }: Props) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    section: {
      marginBottom: theme.spacing.sectionGap,
    },
    title: {
      ...theme.typography.styles.h4,
      color:        theme.colors.primary,
      marginBottom: theme.spacing.sm,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius:    theme.borderRadius.modal,
      paddingVertical: theme.spacing[2.5],
      borderWidth:     1,
      borderColor:     theme.colors.border,
      ...theme.shadows.md,
    },
  });