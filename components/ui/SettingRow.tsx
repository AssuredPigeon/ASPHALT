import Slider from '@react-native-community/slider';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

type SegmentOption = {
  label: string;
  value: string;
};

type Props =
  | {
      label: string;
      type: 'switch';
      value: boolean;
      onValueChange: (val: boolean) => void;
    }
  | {
      label: string;
      type: 'arrow';
    }
  | {
      label: string;
      type: 'segment';
      options: SegmentOption[];
      selected: string;
      onSelect: (val: any) => void;
    }
  | {
      label: string;
      type: 'slider';
      value: number;
      onValueChange: (val: number) => void;
    };

export default function SettingRow(props: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{props.label}</Text>

      {props.type === 'switch' && (
        <Switch
          value={props.value}
          onValueChange={props.onValueChange}
          trackColor={{ true: '#4C8DFF' }}
        />
      )}

      {props.type === 'arrow' && (
        <Text style={styles.arrow}>{'>'}</Text>
      )}

      {props.type === 'segment' && (
        <View style={styles.segmentContainer}>
          {props.options.map(opt => (
            <Pressable
              key={opt.value}
              style={[
                styles.segment,
                props.selected === opt.value && styles.segmentActive
              ]}
              onPress={() => props.onSelect(opt.value)}
            >
              <Text
                style={[
                  styles.segmentText,
                  props.selected === opt.value && styles.segmentTextActive
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
          minimumTrackTintColor="#4C8DFF"
          maximumTrackTintColor="#555"
          thumbTintColor="#4C8DFF"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 15,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: '#fff',
    fontSize: 15,
    flex: 1,
  },
  arrow: {
    color: '#A5C4FF',
    fontSize: 18,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A436B',
    borderRadius: 20,
    padding: 4,
  },
  segment: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  segmentActive: {
    backgroundColor: '#4C8DFF',
  },
  segmentText: {
    color: '#A5C4FF',
    fontSize: 13,
  },
  segmentTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
});
