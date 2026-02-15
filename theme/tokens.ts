import { Platform } from 'react-native'; // Permite saber la plataforma

// Espaciado (base 4)
export const spacing = {
  0:    0,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  3.5:  14,
  4:    16,
  5:    20,
  6:    24,
  7:    28,
  8:    32,
  9:    36,
  10:   40,
  12:   48,
  14:   56,
  16:   64,
  20:   80,
  24:   96,

  // Aliases semánticos
  xs:   4,
  sm:   8,
  md:   16,
  lg:   24,
  xl:   32,
  '2xl': 48,
  '3xl': 64,

  // Específicos de la app
  screenH:    20,   // padding horizontal de pantalla
  screenV:    24,   // padding vertical de pantalla
  cardPadding: 16,
  sectionGap:  24,
  itemGap:     12,
} as const; // valores literales exactos, no el tipo.

// Border Radius
export const borderRadius = {
  none:   0,
  xs:     4,
  sm:     8,
  md:     12,
  lg:     16,
  xl:     20,
  '2xl':  24,
  '3xl':  32,
  full:   9999,

  // Alias semánticos
  card:    16,
  button:  12,
  buttonSm: 8,
  input:   12,
  badge:   20,
  chip:    8,
  modal:   24,
  avatar:  9999,
  icon:    10,
} as const;

// Sombras 
//   Aquí se usa platform; Android: elevation, iOS: otros componentes.
export const shadows = {
  none: {},

  sm: Platform.select({
    ios: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius:  4,
    },
    android: { elevation: 2 },
  }),

  md: Platform.select({
    ios: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius:  8,
    },
    android: { elevation: 4 },
  }),

  lg: Platform.select({
    ios: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius:  16,
    },
    android: { elevation: 8 },
  }),

  xl: Platform.select({
    ios: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: 12 },
      shadowOpacity: 0.2,
      shadowRadius:  24,
    },
    android: { elevation: 12 },
  }),

  // Sombra con color de marca (tarjetas azules)
  primary: Platform.select({
    ios: {
      shadowColor:   '#4C8DFF',
      shadowOffset:  { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius:  12,
    },
    android: { elevation: 6 },
  }),

  // Para bottom sheet / nav bar
  top: Platform.select({
    ios: {
      shadowColor:   '#000',
      shadowOffset:  { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius:  8,
    },
    android: { elevation: 8 },
  }),
} as const;

// Z-Index 
export const zIndex = {
  base:       0,
  raised:     10,
  dropdown:   100,
  sticky:     200,
  overlay:    300,
  modal:      400,
  toast:      500,
  tooltip:    600,
} as const;

// Iconos 
export const iconSize = {
  xs:   14,
  sm:   18,
  md:   22,
  lg:   28,
  xl:   36,
  '2xl': 48,
} as const;

// Tamaños fijos de componentes 
export const componentSize = {
  buttonHeight:   50,
  buttonHeightSm: 40,
  buttonHeightXs: 32,
  inputHeight:    52,
  tabBarHeight:   64,
  headerHeight:   56,
  avatarSm:       36,
  avatarMd:       48,
  avatarLg:       72,
  badgeHeight:    24,
  chipHeight:     32,
} as const;

// Animaciones 
export const animation = {
  fast:    150,
  normal:  250,
  slow:    400,
  slower:  600,
} as const;