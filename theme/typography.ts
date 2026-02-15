export const typography = {
  // Tamaños 
  fontSize: {
    xs:   10,
    sm:   12,
    md:   14,
    base: 15,
    lg:   16,
    xl:   18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
  },

  // Familias 
  fontFamily: {
    light:      'Montserrat-Light',
    regular:    'Montserrat-Regular',
    medium:     'Montserrat-Medium',
    semiBold:   'Montserrat-SemiBold',
    bold:       'Montserrat-Bold',
    extraBold:  'Montserrat-ExtraBold',
  },

  // Line Heights
  lineHeight: {
    tight:    1.2,
    snug:     1.35,
    normal:   1.5,
    relaxed:  1.65,
  },

  // Letter Spacing 
  letterSpacing: {
    tight:  -0.5,
    normal: 0,
    wide:   0.5,
    wider:  1,
    widest: 2,
  },

  // Estilos predefinidos 
  styles: {
    display: {
      fontSize:      32,
      fontFamily:    'Montserrat-ExtraBold',
      lineHeight:    38,
      letterSpacing: -0.5,
    },
    h1: {
      fontSize:      28,
      fontFamily:    'Montserrat-Bold',
      lineHeight:    34,
      letterSpacing: -0.3,
    },
    h2: {
      fontSize:      24,
      fontFamily:    'Montserrat-Bold',
      lineHeight:    30,
      letterSpacing: -0.2,
    },
    h3: {
      fontSize:      20,
      fontFamily:    'Montserrat-SemiBold',
      lineHeight:    26,
    },
    h4: {
      fontSize:      18,
      fontFamily:    'Montserrat-SemiBold',
      lineHeight:    24,
    },
    subtitle: {
      fontSize:      16,
      fontFamily:    'Montserrat-SemiBold',
      lineHeight:    22,
    },
    body: {
      fontSize:      15,
      fontFamily:    'Montserrat-Regular',
      lineHeight:    22,
    },
    bodyMedium: {
      fontSize:      15,
      fontFamily:    'Montserrat-Medium',
      lineHeight:    22,
    },
    bodySemiBold: {
      fontSize:      15,
      fontFamily:    'Montserrat-SemiBold',
      lineHeight:    22,
    },
    caption: {
      fontSize:      13,
      fontFamily:    'Montserrat-Regular',
      lineHeight:    18,
    },
    captionMedium: {
      fontSize:      13,
      fontFamily:    'Montserrat-Medium',
      lineHeight:    18,
    },
    label: {
      fontSize:      12,
      fontFamily:    'Montserrat-Medium',
      lineHeight:    16,
      letterSpacing: 0.3,
    },
    overline: {
      fontSize:      10,
      fontFamily:    'Montserrat-SemiBold',
      lineHeight:    14,
      letterSpacing: 1.5,
      textTransform: 'uppercase' as const,
    },
    button: {
      fontSize:      15,
      fontFamily:    'Montserrat-SemiBold',
      lineHeight:    20,
      letterSpacing: 0.3,
    },
    buttonSm: {
      fontSize:      13,
      fontFamily:    'Montserrat-SemiBold',
      lineHeight:    18,
      letterSpacing: 0.2,
    },

    //  Compat 
    title:    { fontSize: 24, fontFamily: 'Montserrat-Bold'     },
    desc:     { fontSize: 12, fontFamily: 'Montserrat-Light'    },
  },
};