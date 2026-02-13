import { StyleSheet, Text, View } from 'react-native';

type Props = {
  title: string;
  children: React.ReactNode;
};

export default function SettingsSection({ title, children }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 25,
  },
  title: {
    color: '#A5C4FF',
    fontSize: 18,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#1E3557',
    borderRadius: 20,
    paddingVertical: 10,
  },
});
