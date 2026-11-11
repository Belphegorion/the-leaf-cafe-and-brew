/**
 * Design Tokens for The Leaf – Cafe and Brew
 *
 * Colour Balance:
 * 60% Warm Beige surfaces / canvas
 * 25% Pure White / crisp card interiors
 * 12% Botanical Leaf Green brand accents & primary CTAs
 *  3% Functional / status / alert details
 */

export const TOKENS = {
  colors: {
    // Warm Beige Scale (Canvas, Cards, Dividers)
    beige: {
      50: '#FBF8F2',  // Card core / alternate section background
      100: '#F5EFE4', // Primary light canvas background
      200: '#EDE3D1', // Secondary section background / double-bezel rim
      300: '#E0D2B8', // Borders, subtle separators, input borders
      500: '#B8A582', // Decorative muted icons, ornaments (never small body text)
    },
    // Ink Scale (High-Contrast Typography)
    ink: {
      DEFAULT: '#1F2A22', // Primary body & heading text on beige/white (12.35:1 contrast)
      soft: '#38483C',    // Secondary body text, subtitles, captions (6.17:1 contrast, passes AA)
    },
    // Leaf Green Scale (Brand Accent, Primary Buttons, Active States, Footer)
    leaf: {
      primary: '#325736', // Signature brand green (circle logo, primary CTA)
      hover: '#284A2D',   // Active / hover state
      light: '#5E8662',   // Secondary green accent
      tint: '#EEF5EE',    // Pale green pill tint
      white: '#F7FBFA',   // Monoline icon stroke & logo inner lines
    },
    green: {
      50: '#EEF5EE',
      100: '#E2EEE2',
      200: '#C9DCC9',
      300: '#A3C2A5',
      500: '#5E8662',
      700: '#325736',
      800: '#284A2D',
      900: '#1F3A24',
      950: '#142318',
    },
    // Dark Sanctuary Mode
    dark: {
      bg: '#101C13',       // Deep obsidian-green background
      surface: '#1F3A24',  // Elevated surface cards
      border: '#284A2D',   // Dark mode border
      text: '#EDE3D1',     // Warm beige text on dark (11.2:1 contrast)
      textSoft: '#C9DCC9', // Secondary light green text on dark (6.8:1 contrast)
    },
  },
  typography: {
    display: "'Josefin Sans', sans-serif",
    artdeco: "'Poiret One', cursive",
    body: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
    minBodySizeMobile: '16px',
    lineHeightBody: '1.6',
    lineHeightTight: '1.1',
  },
  proportions: {
    beigeSurfaces: '60%',
    whiteSurfaces: '25%',
    greenAccents: '12%',
    functionalAccents: '3%',
  },
  shadows: {
    warmSm: '0 1px 3px rgba(50, 87, 54, 0.06), 0 1px 2px rgba(50, 87, 54, 0.04)',
    warmMd: '0 4px 16px -2px rgba(50, 87, 54, 0.08)',
    warmLg: '0 10px 30px -4px rgba(50, 87, 54, 0.1)',
    warmXl: '0 20px 40px -8px rgba(50, 87, 54, 0.12)',
  },
} as const;

export type Tokens = typeof TOKENS;
