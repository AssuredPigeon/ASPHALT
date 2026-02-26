import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ActivityIndicator,
    FlatList,
    Keyboard,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type SearchResult = {
  place_id?:     string;
  display_name?: string;
  lat:           string;
  lon:           string;
};

interface Props {
  visible:      boolean;
  onClose:      () => void;
  onStart:      (lat: number, lon: number, name: string) => void;
  location?:    Location.LocationObject | null;
  // Destino pre-cargado — viene de "Cómo llegar" en el SearchModal
  preselected?: { lat: number; lon: number; name: string } | null;
}

export default function DrivingDestinationModal({
  visible,
  onClose,
  onStart,
  location,
  preselected,
}: Props) {
  const { theme } = useTheme();
  const styles    = makeStyles(theme);
  const { t }     = useTranslation();

  const [query,    setQuery]    = useState('');
  const [results,  setResults]  = useState<SearchResult[]>([]);
  const [loading,  setLoading]  = useState(false);
  const [selected, setSelected] = useState<{ lat: number; lon: number; name: string } | null>(null);

  // Si llega un destino pre-cargado (desde "Cómo llegar"), usarlo directamente
  useEffect(() => {
    if (preselected && visible) {
      setSelected(preselected);
      // Mostrar solo el primer fragmento del nombre largo
      setQuery(preselected.name.split(',')[0]);
      setResults([]);
    }
  }, [preselected, visible]);

  // Limpiar estado al cerrar
  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setSelected(null);
    }
  }, [visible]);

  const searchLocation = async (text: string) => {
    setQuery(text);
    setSelected(null); // Nueva búsqueda invalida la selección anterior

    if (text.length < 3) { setResults([]); return; }

    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=6`,
        {
          headers: {
            'User-Agent': 'AsphaltApp/1.0',
            'Accept':     'application/json',
          },
        }
      );
      const data = await res.json();
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (item: SearchResult) => {
    const name = item.display_name ?? t('driving.defaultDestination');
    setSelected({ lat: Number(item.lat), lon: Number(item.lon), name });
    setQuery(name.split(',')[0]); // Nombre corto en el input
    setResults([]);
    Keyboard.dismiss();
  };

  const handleStart = () => {
    if (!selected) return;
    onStart(selected.lat, selected.lon, selected.name);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      {/* Fondo semitransparente — al tocarlo se cierra */}
      <Pressable style={styles.backdrop} onPress={onClose}>

        {/* Tarjeta central — onPress vacío para no propagarlo al backdrop */}
        <Pressable style={styles.card} onPress={() => {}}>

          {/* Título */}
          <Text style={styles.title}>{t('driving.destinationTitle')}</Text>

          {/* Input de búsqueda con icono */}
          <View style={[styles.inputRow, selected && styles.inputRowSelected]}>
            <Ionicons
              name={selected ? 'checkmark-circle' : 'location-outline'}
              size={18}
              color={selected ? '#4CAF50' : theme.colors.textSecondary}
            />
            <TextInput
              style={styles.input}
              placeholder={t('driving.destinationPlaceholder')}
              placeholderTextColor={theme.colors.inputPlaceholder}
              value={query}
              onChangeText={searchLocation}
              autoFocus={!preselected}
              selectionColor={theme.colors.primary}
            />
            {/* Botón limpiar */}
            {query.length > 0 && (
              <Pressable
                onPress={() => { setQuery(''); setResults([]); setSelected(null); }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* Cargando resultados */}
          {loading && (
            <ActivityIndicator
              size="small"
              color={theme.colors.primary}
              style={{ marginTop: theme.spacing[2] }}
            />
          )}

          {/* Lista de resultados de búsqueda */}
          {results.length > 0 && (
            <FlatList
              data={results}
              keyExtractor={(item, idx) => item.place_id ?? String(idx)}
              style={styles.resultsList}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.resultItem}
                  onPress={() => handleSelectResult(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="location-outline" size={15} color={theme.colors.textSecondary} />
                  <Text style={styles.resultText} numberOfLines={2}>
                    {item.display_name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Botón Comenzar */}
          <TouchableOpacity
            style={[styles.startBtn, !selected && styles.startBtnDisabled]}
            onPress={handleStart}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <Ionicons
              name="navigate"
              size={18}
              color={selected ? '#fff' : theme.colors.textSecondary}
            />
            <Text style={[styles.startBtnText, !selected && styles.startBtnTextDisabled]}>
              {t('driving.startButton')}
            </Text>
          </TouchableOpacity>

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    backdrop: {
      flex:            1,
      backgroundColor: theme.colors.overlay,
      justifyContent:  'center',
      alignItems:      'center',
      padding:         theme.spacing.screenH,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius:    theme.borderRadius.modal,
      padding:         theme.spacing[5],
      width:           '100%',
      gap:             theme.spacing[3],
      ...theme.shadows.xl,
    },
    title: {
      ...theme.typography.styles.h3,
      color: theme.colors.text,
    },
    inputRow: {
      flexDirection:     'row',
      alignItems:        'center',
      gap:               theme.spacing[2],
      backgroundColor:   theme.colors.inputBackground,
      borderRadius:      theme.borderRadius.input,
      borderWidth:       1,
      borderColor:       theme.colors.inputBorder,
      paddingHorizontal: theme.spacing[3],
      paddingVertical:   theme.spacing[2.5],
    },
    inputRowSelected: {
      borderColor: '#4CAF50', // Verde cuando hay destino confirmado
    },
    input: {
      flex:  1,
      color: theme.colors.text,
      ...theme.typography.styles.body,
    },
    resultsList: {
      maxHeight:    200,
      borderRadius: theme.borderRadius.md,
      borderWidth:  1,
      borderColor:  theme.colors.border,
      overflow:     'hidden',
    },
    resultItem: {
      flexDirection:     'row',
      alignItems:        'flex-start',
      gap:               theme.spacing[2],
      padding:           theme.spacing[3],
      borderBottomWidth: 0.5,
      borderBottomColor: theme.colors.divider,
    },
    resultText: {
      flex: 1,
      ...theme.typography.styles.caption,
      color: theme.colors.text,
    },
    startBtn: {
      flexDirection:   'row',
      alignItems:      'center',
      justifyContent:  'center',
      gap:             theme.spacing[2],
      backgroundColor: theme.colors.primary,
      borderRadius:    theme.borderRadius.full,
      paddingVertical: theme.spacing[3.5],
      marginTop:       theme.spacing[1],
    },
    startBtnDisabled: {
      backgroundColor: theme.colors.surfaceSecondary,
    },
    startBtnText: {
      ...theme.typography.styles.captionMedium,
      color:      '#fff',
      fontWeight: '600',
    },
    startBtnTextDisabled: {
      color: theme.colors.textSecondary,
    },
  });