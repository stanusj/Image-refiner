import { PresetFilter } from './types';

export const PHOTO_PRESETS: PresetFilter[] = [
  {
    id: 'original',
    name: 'Raw / Original',
    description: 'No filters applied to the file',
    adjustments: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      exposure: 100,
      vignette: 0,
      blur: 0,
      sharpness: 0,
    },
  },
  {
    id: 'editorial_sage',
    name: 'Sage Editorial',
    description: 'Sophisticated muted greens & warm matte feel',
    adjustments: {
      brightness: 104,
      contrast: 105,
      saturation: 90,
      warmth: 12,
      exposure: 102,
      vignette: 12,
      blur: 0,
      sharpness: 20,
    },
  },
  {
    id: 'vibrant_pop',
    name: 'Vibrant Pop',
    description: 'Crisp highlights & rich, punchy saturation',
    adjustments: {
      brightness: 106,
      contrast: 114,
      saturation: 124,
      warmth: 4,
      exposure: 105,
      vignette: 5,
      blur: 0,
      sharpness: 40,
    },
  },
  {
    id: 'golden_light',
    name: 'Morning Light',
    description: 'Warm, airy golden glow with low-shadow contrast',
    adjustments: {
      brightness: 110,
      contrast: 98,
      saturation: 108,
      warmth: 18,
      exposure: 108,
      vignette: 8,
      blur: 0,
      sharpness: 10,
    },
  },
  {
    id: 'scandinavian_cool',
    name: 'Nordic Pale',
    description: 'Minimalist high-key highlights & cold blue cast',
    adjustments: {
      brightness: 112,
      contrast: 94,
      saturation: 80,
      warmth: -14,
      exposure: 108,
      vignette: 0,
      blur: 0,
      sharpness: 15,
    },
  },
  {
    id: 'noir_classic',
    name: 'Noir Classic',
    description: 'Artistic high-contrast silver black & white',
    adjustments: {
      brightness: 95,
      contrast: 128,
      saturation: 0,
      warmth: 0,
      exposure: 100,
      vignette: 18,
      blur: 0,
      sharpness: 30,
    },
  },
];

export const INITIAL_ADJUSTMENTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  warmth: 0,
  exposure: 100,
  vignette: 0,
  blur: 0,
  sharpness: 0,
};

export const INITIAL_WEBSITE_SETTINGS = {
  heading: 'Design is simple. Beautiful is hard.',
  subheading: 'We curate bespoke material concepts, tactile mood boards, and textured living spaces designed for architectural permanence.',
  ctaText: 'Request a Consultation',
  fontStyle: 'editorial' as const,
  overlayOpacity: 25,
  textColor: 'text-white',
  accentColor: '#8a9fa6', // Sage-olive accent
};
