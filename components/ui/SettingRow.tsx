import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import Slider from '@react-native-community/slider';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

type SegmentOption = {
  label: string;
  value: string;
};

type Props = // Un solo componente puede comportarse diferente según un prop: solo permite props validas para el componente
  | { label: string; type: 'switch'; value: boolean; onValueChange: (val: boolean) => void }
  | { label: string; type: 'arrow' }
  | { label: string; type: 'segment'; options: SegmentOption[]; selected: string; onSelect: (val: any) => void }
  | { label: string; type: 'slider'; value: number; onValueChange: (val: number) => void };

export default function SettingRow(props: Props) {
  const { theme } = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{props.label}</Text>

      {props.type === 'switch' && (
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          trackColor={{
            false: theme.colors.surfaceTertiary,
            true:  theme.colors.primary,
          }}
          thumbColor={theme.colors.text}
        />
      )}

      {props.type === 'arrow' && (
        <Text style={styles.arrow}>{'›'}</Text>
      )}

      {props.type === 'segment' && (
        <View style={styles.segmentContainer}>
          {props.options.map(opt => (
            <Pressable
              key={opt.value}
              style={[
                styles.segment,
                props.selected === opt.value && styles.segmentActive,
              ]}
              onPress={() => props.onSelect(opt.value)}
            >
              <Text
                style={[
                  styles.segmentText,
                  props.selected === opt.value && styles.segmentTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {props.type === 'slider' && (
        <Slider
          style={{ width: 120 }}
          minimumValue={0}
          maximumValue={1}
          value={props.value}
          onValueChange={props.onValueChange}
          minimumTrackTintColor={theme.colors.primary}
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor={theme.colors.primary}
        />
      )}
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical:   theme.spacing[3.5],
      flexDirection:     'row',
      alignItems:        'center',
      justifyContent:    'space-between',
    },
    label: {
      ...theme.typography.styles.body,
      color: theme.colors.text,
      flex:  1,
    },
    arrow: {
      color:    theme.colors.primary,
      fontSize: theme.typography.fontSize.xl,
    },
    segmentContainer: {
      flexDirection:   'row',
      backgroundColor: theme.colors.surfaceTertiary,
      borderRadius:    theme.borderRadius.full,
      padding:         4,
    },
    segment: {
      paddingHorizontal: theme.spacing[3],
      paddingVertical:   theme.spacing[1.5],
      borderRadius:      theme.borderRadius.full,
    },
    segmentActive: {
      backgroundColor: theme.colors.primary,
    },
    segmentText: {
      ...theme.typography.styles.captionMedium,
      color: theme.colors.textSecondary,
    },
    segmentTextActive: {
      ...theme.typography.styles.captionMedium,
      color:      theme.colors.textInverse,
      fontFamily: theme.typography.fontFamily.semiBold,
    },
  });