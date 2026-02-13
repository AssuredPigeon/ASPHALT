import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (lat: number, lon: number, name: string) => void;
  location?: Location.LocationObject | null;
};

const CATEGORY_ICONS: Record<string, IoniconsName> = {
  Hoteles:     'bed-outline',
  Almuerzo:    'restaurant-outline',
  Gasolineras: 'water-outline',
  Motel:       'bed-outline',
  Cafeterías:  'cafe-outline',
};

type SearchResult = {
  place_id?: string;
  display_name?: string;
  name?: string;
  lat: number | string;
  lon: number | string;
  category?: string;
};

export default function SearchModal({ visible, onClose, onSelectLocation, location }: Props) {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const recentSearches: SearchResult[] = [
    { name: 'Panamericano · Tijuana', lat: 32.524, lon: -117.021 },
    { name: 'Waldos · Tijuana',       lat: 32.525, lon: -117.020 },
  ];

  const nearbyCategories = [
    { name: 'Hoteles',     category: 'Hoteles',     icon: 'bed-outline'        as IoniconsName },
    { name: 'Almuerzo',    category: 'Almuerzo',    icon: 'restaurant-outline' as IoniconsName },
    { name: 'Gasolineras', category: 'Gasolineras', icon: 'water-outline'      as IoniconsName },
    { name: 'Motel',       category: 'Motel',       icon: 'bed-outline'        as IoniconsName },
    { name: 'Cafeterías',  category: 'Cafeterías',  icon: 'cafe-outline'       as IoniconsName },
  ];

  const searchLocation = async (text: string) => {
    setQuery(text);
    if (text.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&addressdetails=1&limit=10`);
      const data = await res.json();
      setResults(data);
    } catch (e) {
      console.log('Error buscando ubicación:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: SearchResult) => {
    onSelectLocation(Number(item.lat), Number(item.lon), item.display_name ?? item.name ?? 'Ubicación');
    setQuery('');
    setResults([]);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* ── Barra de búsqueda ── */}
          <View style={styles.header}>
            <Ionicons name="search" size={18} color="#8BA1C8" style={styles.searchIcon} />
            <TextInput
              placeholder="Buscar ubicación"
              value={query}
              onChangeText={searchLocation}
              style={styles.input}
              autoFocus
              placeholderTextColor="#8BA1C8"
              selectionColor="#1A55B7"
            />
            <Pressable onPress={onClose} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>

          {loading && <ActivityIndicator size="small" color="#8BA1C8" style={{ marginVertical: 8 }} />}

          {/* ── Lista ── */}
          <FlatList
            data={query.length > 0 ? results : recentSearches}
            keyExtractor={(item, index) => item.place_id ?? (item.name ?? '') + index}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)} activeOpacity={0.7}>
                <View style={styles.resultIcon}>
                  <Ionicons
                    name={item.category ? (CATEGORY_ICONS[item.category] ?? 'location-outline') : 'time-outline'}
                    size={18}
                    color="#8BA1C8"
                  />
                </View>
                <Text style={styles.resultText} numberOfLines={1}>
                  {item.display_name ?? item.name ?? 'Sin nombre'}
                </Text>
              </TouchableOpacity>
            )}
            ListHeaderComponent={
              query.length === 0 ? (
                <View>
                  {/* ── Encuentra cerca ── */}
                  <Text style={styles.sectionTitle}>Encuentra cerca</Text>
                  <FlatList
                    data={nearbyCategories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.name}
                    contentContainerStyle={{ paddingBottom: 4 }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.categoryItem}
                        activeOpacity={0.75}
                        onPress={() => handleSelect({
                          lat: location?.coords.latitude  ?? 0,
                          lon: location?.coords.longitude ?? 0,
                          name: item.name,
                          category: item.category,
                        })}
                      >
                        <Ionicons name={item.icon} size={20} color="#F4F4F8" />
                        <Text style={styles.categoryText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />

                  {/* ── Recientes ── */}
                  <Text style={styles.sectionTitle}>Recientes</Text>
                </View>
              ) : null
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
}

// ── Paleta ──────────────────────────────────────
// #0B2145  fondo principal (azul marino oscuro)
// #152D5C  tarjetas / barra de búsqueda
// #1A3870  botones de categoría
// #8BA1C8  textos secundarios / iconos / placeholder
// #F4F4F8  texto primario (blanco suave)
// ────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-start',
  },
  container: {
    backgroundColor: '#0B2145',
    marginTop: 55,
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 15,
    paddingTop: 14,
  },

  // Barra
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#152D5C',
    borderRadius: 14,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 11,
    color: '#F4F4F8',
  },
  cancelText: {
    color: '#8BA1C8',
    fontSize: 14,
    marginLeft: 10,
    paddingVertical: 11,
  },

  // Resultados
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#1A3870',
  },
  resultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#152D5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  resultText: {
    flex: 1,
    fontSize: 14,
    color: '#F4F4F8',
  },

  // Secciones
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8BA1C8',
    marginTop: 16,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Chips de categoría — pill shape como en la imagen
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A3870',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    marginRight: 10,
    gap: 8,
  },
  categoryText: {
    color: '#F4F4F8',
    fontSize: 13,
    fontWeight: '500',
  },
});