import React, { useMemo } from 'react';
import { Polyline } from 'react-native-maps';

// El molde que espera el componente
export interface CalleEstado {
  id_calle:            number;
  calle_nombre:        string;
  indice_calidad:      string;
  fecha_actualizacion: string;
  coordinates: { lat: number; lng: number }[];
}

interface Props {
  calles:  CalleEstado[];
  visible: boolean;
}

// Manejo de colores dependiendo la calidad
function getLayers(indice: string) {
  const v = parseFloat(indice);

  if (v <= 25) {
    // Índice de glow
    const i = 1 - v / 25; // índice 0 → i=1.0 (máximo), índice 25 → i=0.0 (mínimo)
    return {
      outer: { color: `rgba(255, 20,  20, ${0.10 + i * 0.10})`, width: 26 }, // halo exterior
      mid:   { color: `rgba(230, 30,  30, ${0.30 + i * 0.12})`, width: 12 }, // cuerpo
      core:  { color: `rgba(255, 90,  90, 0.95)`,               width:  4 }, // núcleo
    };
  }
  if (v <= 50) {
    const t = (v - 26) / 24;
    return {
      outer: { color: `rgba(255, 110, 10, ${0.11 - t * 0.02})`, width: 22 },
      mid:   { color: `rgba(235,  90,  5, ${0.28 - t * 0.04})`, width: 11 },
      core:  { color: `rgba(255, 150, 50, 0.88)`,               width:  4 },
    };
  }
  if (v <= 75) {
    const t = (v - 51) / 24;
    return {
      outer: { color: `rgba(255, 200,  0, ${0.08 - t * 0.02})`, width: 18 },
      mid:   { color: `rgba(210, 170,  0, ${0.20 - t * 0.04})`, width:  9 },
      core:  { color: `rgba(245, 205, 30, 0.82)`,               width:  3 },
    };
  }
  const t = (v - 76) / 24;
  return {
    outer: { color: `rgba(20,  190, 70, ${0.05 + t * 0.02})`, width: 14 },
    mid:   { color: `rgba(15,  170, 60, ${0.12 + t * 0.04})`, width:  7 },
    core:  { color: `rgba(50,  220, 90, ${0.72 + t * 0.10})`, width:  3 },
  };
}

const StreetQualityLayer: React.FC<Props> = ({ calles, visible }) => {
  const streets = useMemo( // Memo: Evita recalcular, solo cuando calles cambia
    () =>
      calles.map((c, i) => ({
        // Combinar id + índice para garantizar keys únicos aunque Overpass
        // devuelva múltiples segmentos del mismo nombre de calle
        uid:    `${c.id_calle}-${i}`, // Key única
        coords: c.coordinates.map(p => ({ latitude: p.lat, longitude: p.lng })), // Formato que pide react
        layers: getLayers(c.indice_calidad),
      })),
    [calles] // Recalcula en caso de que cambien
  );

  if (!visible || streets.length === 0) return null;

  return (
    <>
      {streets.map(s => (
        <React.Fragment key={s.uid}>
          <Polyline coordinates={s.coords} strokeColor={s.layers.outer.color} strokeWidth={s.layers.outer.width} lineCap="round" lineJoin="round" geodesic />
          <Polyline coordinates={s.coords} strokeColor={s.layers.mid.color}   strokeWidth={s.layers.mid.width}   lineCap="round" lineJoin="round" geodesic />
          <Polyline coordinates={s.coords} strokeColor={s.layers.core.color}  strokeWidth={s.layers.core.width}  lineCap="round" lineJoin="round" geodesic />
        </React.Fragment>
      ))}
    </>
  );
};

export default StreetQualityLayer;
