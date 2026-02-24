import { StyleSheet, Text, View } from 'react-native';

interface Props {
    location: any;
}

export default function AsphaltMap({ location }: Props) {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>
                El mapa no está disponible en la versión web.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1a1a2e',
    },
    text: {
        color: '#ffffff',
        fontSize: 16,
    },
});