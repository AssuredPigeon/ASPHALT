{/* Cómo usar:
     import { useTheme, spacing, borderRadius, ... } from '@/theme'; */}

// export: exporta algo que existe en runtime
// export type: exporta solo información de tipos (solo compile-time)

export { darkTheme } from './dark';
export { lightTheme } from './light';
export { ThemeProvider, useTheme } from './ThemeContext';
export type { AppTheme } from './ThemeContext';
export {
    animation, borderRadius, componentSize, iconSize, shadows, spacing, zIndex
} from './tokens';
export { typography } from './typography';

// Archivo organizador que actúa como fachada del módulo.