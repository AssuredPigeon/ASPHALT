import React, { createContext, useContext, useState } from 'react';
import { darkTheme } from './dark';
import { lightTheme } from './light';
import { animation, borderRadius, componentSize, iconSize, shadows, spacing, zIndex } from './tokens';
import { typography } from './typography';

// Tipo del tema completo 
const fullTheme = {
  colors:        darkTheme.colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  iconSize,
  componentSize,
  animation,
};

export type AppTheme = typeof fullTheme;

type ThemeContextType = {
  theme:       AppTheme;
  isDark:      boolean;
  toggleTheme: () => void; // función
};

// Crea el contenedor general e inicialmente no tiene valor, hasta el provider
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

//  Provider: proporciona el tema a todos los componentes (permite distribuir datos en una sección descendiente a el)
// parametro que recibe la función es un obj children cuyo tipo es cualquier cosa q react pueda renderizar
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isDark, setIsDark] = useState(true); // desestructuración de array: const isDark = state[0]; const setIsDark = state[1];

  // invierte el valor mediante un setter; prev (valor + reciente)
  const toggleTheme = () => setIsDark(prev => !prev);

  // colo cambian dependiendo si "isDark"
  const theme: AppTheme = { // validación estructurual, es decir, debe cumplir con lo q pide
                  // condición ? valorSiTrue : valorSiFalse
    colors:        isDark ? darkTheme.colors : lightTheme.colors,
    // Shorthand property: abrevia obj
    typography,
    spacing,
    borderRadius,
    shadows,
    zIndex,
    iconSize,
    componentSize,
    animation,
  };

  // retorno JSX: JavaScript XML; Similar a HTML pero dentro de JS. 
  return ( // en resumen, q renderize lo q esté dentro del provider
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

//  Hook: valida q esté dentro del provider
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
};

// Re-exports para importar todo desde un solo lugar 
export { animation, borderRadius, componentSize, iconSize, shadows, spacing, zIndex } from './tokens';
export { typography } from './typography';

