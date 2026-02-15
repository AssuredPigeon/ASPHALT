import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
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
  visible:          boolean;
  onClose:          () => void;
  onSelectLocation: (lat: number, lon: number, name: string) => void;
  location?:        Location.LocationObject | null;
};

const CATEGORY_ICONS: Record<string, IoniconsName> = {
  Hoteles:     'bed-outline',
  Almuerzo:    'restaurant-outline',
  Gasolineras: 'water-outline',
  Motel:       'bed-outline',
  Cafeterías:  'cafe-outline',
};

type SearchResult = {
  place_id?:     string;
  display_name?: string;
  name?:         string;
  lat:           number | string;
  lon:           number | string;
  category?:     string;
};

export default function SearchModal({ visible, onClose, onSelectLocation, location }: Props) {
  const { theme } = useTheme();
  const styles    = makeStyles(theme);

  const [query,   setQuery]   = useState('');
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

          {/* Barra de búsqueda */}
          <View style={styles.header}>
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              placeholder="Buscar ubicación"
              value={query}
              onChangeText={searchLocation}
              style={styles.input}
              autoFocus
              placeholderTextColor={theme.colors.inputPlaceholder}
              selectionColor={theme.colors.primary}
            />
            <Pressable
              onPress={onClose}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </View>

          {loading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ marginVertical: theme.spacing.sm }}
            />
          )}

          {/* Lista */}
          <FlatList
            data={query.length > 0 ? results : recentSearches}
            keyExtractor={(item, index) => item.place_id ?? (item.name ?? '') + index}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.resultItem}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.resultIcon}>
                  <Ionicons
                    name={item.category ? (CATEGORY_ICONS[item.category] ?? 'location-outline') : 'time-outline'}
                    size={18}
                    color={theme.colors.textSecondary}
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
                  {/* Encuentra cerca */}
                  <Text style={styles.sectionTitle}>Encuentra cerca</Text>
                  <FlatList
                    data={nearbyCategories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(item) => item.name}
                    contentContainerStyle={{ paddingBottom: theme.spacing[1] }}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.categoryItem}
                        activeOpacity={0.75}
                        onPress={() => handleSelect({
                          lat:      location?.coords.latitude  ?? 0,
                          lon:      location?.coords.longitude ?? 0,
                          name:     item.name,
                          category: item.category,
                        })}
                      >
                        <Ionicons name={item.icon} size={20} color={theme.colors.text} />
                        <Text style={styles.categoryText}>{item.name}</Text>
                      </TouchableOpacity>
                    )}
                  />

                  {/* Recientes */}
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

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex:            1,
      backgroundColor: theme.colors.overlay,
      justifyContent:  'flex-start',
    },
    container: {
      backgroundColor:     theme.colors.background,
      marginTop:           55,
      flex:                1,
      borderTopLeftRadius:  theme.borderRadius.modal,
      borderTopRightRadius: theme.borderRadius.modal,
      paddingHorizontal:   theme.spacing.screenH,
      paddingTop:          theme.spacing[3.5],
    },

    // Barra
    header: {
      flexDirection:    'row',
      alignItems:       'center',
      backgroundColor:  theme.colors.inputBackground,
      borderRadius:     theme.borderRadius.input,
      borderWidth:      1,
      borderColor:      theme.colors.inputBorder,
      paddingHorizontal: theme.spacing[3],
      marginBottom:     theme.spacing[2.5],
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    input: {
      flex:            1,
      ...theme.typography.styles.body,
      paddingVertical: theme.spacing[2.5],
      color:           theme.colors.text,
    },
    cancelText: {
      ...theme.typography.styles.captionMedium,
      color:          theme.colors.textSecondary,
      marginLeft:     theme.spacing.sm,
      paddingVertical: theme.spacing[2.5],
    },

    // Resultados
    resultItem: {
      flexDirection:   'row',
      alignItems:      'center',
      paddingVertical: theme.spacing[3],
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.divider,
    },
    resultIcon: {
      width:           36,
      height:          36,
      borderRadius:    18,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems:      'center',
      justifyContent:  'center',
      marginRight:     theme.spacing[3],
    },
    resultText: {
      flex: 1,
      ...theme.typography.styles.caption,
      color: theme.colors.text,
    },

    // Secciones
    sectionTitle: {
      ...theme.typography.styles.overline,
      color:        theme.colors.textSecondary,
      marginTop:    theme.spacing.md,
      marginBottom: theme.spacing[2.5],
    },

    // Chips de categoría
    categoryItem: {
      flexDirection:    'row',
      alignItems:       'center',
      backgroundColor:  theme.colors.surfaceTertiary,
      paddingVertical:  theme.spacing[2.5],
      paddingHorizontal: theme.spacing.md,
      borderRadius:     theme.borderRadius.full,
      marginRight:      theme.spacing[2.5],
      borderWidth:      1,
      borderColor:      theme.colors.primaryBorder,
      gap:              theme.spacing.sm,
    },
    categoryText: {
      ...theme.typography.styles.captionMedium,
      color: theme.colors.text,
    },
  });