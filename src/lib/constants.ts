// src/lib/constants.ts
export const REVEAL_DATE = new Date('2026-01-06T00:00:00'); // Día de Reyes

export const COLORS = {
    primary: {
        light: '#E6F2FF',     // Celeste muy claro
        base: '#8ECAE6',      // Celeste polvoriento
        dark: '#219EBC'       // Celeste profundo
    },
    secondary: {
        light: '#F0F7E6',     // Verde musgo claro
        base: '#8CB369',      // Verde musgo
        dark: '#5B8E5F'       // Verde profundo
    },
    accent: {
        gold: '#FFB703',      // Dorado
        warm: '#FB8500'       // Naranja suave
    },
    neutral: {
        paper: '#FFFCF2',     // Color papel antiguo
        ink: '#2D3142'        // Color tinta
    }
} as const;

export const TYPOGRAPHY = {
    heading: "'Playfair Display', serif",
    body: "'Inter', -apple-system, sans-serif",
    decorative: "'Cormorant Garamond', serif"
} as const;

export const SITE_METADATA = {
    title: 'Biblioteca Cantaribeña',
    description: 'Un regalo que se construye con historias',
    author: 'Familia Cantaribeña'
} as const;