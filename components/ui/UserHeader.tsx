import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  userName?: string;
};

{/* Aquí va el nombre del usuario, luego conectarlo con el auth */}
export default function UserHeader({ userName = 'Ainy' }: Props) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { t } = useTranslation();

  return (
    <View style={styles.row}>

      {/* Avatar placeholder */}
      <View style={styles.avatar} />

      <View style={styles.textContainer}>
        <Text style={styles.hola}>{t('userHeader.hello')}</Text>

        <Text style={styles.name}>
          {t('userHeader.traveler')}{' '}
          <Text style={styles.userName}>{userName}</Text>
        </Text>

        <Pressable onPress={() => router.navigate('/Profile')}>
          <Text style={styles.link}>{t('userHeader.viewProfile')}</Text>
        </Pressable>
      </View>

    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap:           theme.spacing[3.5],
      alignItems:    'center',
    },
    avatar: {
      width:           theme.componentSize.avatarLg,
      height:          theme.componentSize.avatarLg,
      borderRadius:    theme.borderRadius.lg,
      backgroundColor: theme.colors.surfaceTertiary,
      borderWidth:     2,
      borderColor:     theme.colors.primaryBorder,
    },
    textContainer: {
      justifyContent: 'center',
    },
    hola: {
      ...theme.typography.styles.subtitle,
      color:   theme.colors.textSecondary,
      opacity: 0.85,
    },
    name: {
      ...theme.typography.styles.h2,
      color: theme.colors.text,
    },
    userName: {
      ...theme.typography.styles.h2,
      color:      theme.colors.primary,
      fontFamily: theme.typography.fontFamily.bold,
    },
    link: {
      ...theme.typography.styles.body,
      color:      theme.colors.primary,
      marginTop:  theme.spacing[1],
      opacity:    0.8,
    },
  });