import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

type Props = {
  onActivate: () => void;
};

export default function SearchBar({ onActivate }: Props) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const { t } = useTranslation();

  return (
    <Pressable onPress={onActivate} style={styles.pressable}>
      <View style={styles.container}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
        <TextInput
          placeholder={t('search.placeholder')}
          placeholderTextColor={theme.colors.inputPlaceholder}
          style={styles.input}
          editable={false}
          pointerEvents="none"
        />
      </View>
    </Pressable>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    pressable: {
      position: 'absolute',
      top:      60,
      left:     theme.spacing.screenH,
      right:    theme.spacing.screenH,
      zIndex:   theme.zIndex.sticky,
    },
    container: {
      backgroundColor:  theme.colors.surface,
      borderRadius:     theme.borderRadius.full,
      flexDirection:    'row',
      alignItems:       'center',
      paddingHorizontal: theme.spacing.md,
      height:           theme.componentSize.buttonHeightSm + 5,
      borderWidth:      1,
      borderColor:      theme.colors.border,
      ...theme.shadows.lg,
    },
    input: {
      marginLeft: theme.spacing.sm,
      color:      theme.colors.text,
      flex:       1,
      ...theme.typography.styles.body,
    },
  });