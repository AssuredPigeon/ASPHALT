import AsyncStorage from '@react-native-async-storage/async-storage'; // local storage
import { useEffect, useState } from 'react';

const STORAGE_KEY  = '@asphalt_recent_searches'; // El nombre con el que se guardan
const MAX_SEARCHES = 8;

export type RecentSearch = {
  name: string;
  lat:  number;
  lon:  number;
};

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

 {/*  Cargar al montar 
    - funciona como una promesa: este busca y si no encuentra; catch: no hagas nada
    - Si encuentra entonces; raw recibe de AsyncStorage y se convierte a un array de obj de JS 
    */}
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then(raw => { if (raw) setRecentSearches(JSON.parse(raw)); }) 
      .catch(() => {});
  }, []); // solo una vez al montar

  const saveSearch = async (item: RecentSearch) => {
    if (!item.name?.trim()) return;

    const updated = [
      item, // Primero la más reciente
      ...recentSearches.filter(s => s.name !== item.name), // Evita duplicados y operador spread (...) expande 
    ].slice(0, MAX_SEARCHES); // Si llega al max, el más viejo desaparece

    setRecentSearches(updated); // Actualiza: se re-renderiza
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {}); // permanece en el dispositivo
  };

  // Filtra sobre el elemento y crea un nuevo array
  const removeSearch = async (name: string) => {
    const updated = recentSearches.filter(s => s.name !== name); // filtra por nombre para eliminar
    setRecentSearches(updated); //  el item desaparezca de la lista
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  };

  // Borra por completo desde AsyncStorage
  const clearAll = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem(STORAGE_KEY).catch(() => {});
  };

  return { recentSearches, saveSearch, removeSearch, clearAll };
}