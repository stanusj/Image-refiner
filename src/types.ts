export interface ImageAdjustments {
  brightness: number; // 0 to 200 (default 100)
  contrast: number; // 0 to 200 (default 100)
  saturation: number; // 0 to 200 (default 100)
  warmth: number; // -50 to 50 (default 0)
  exposure: number; // 0 to 200 (default 100)
  vignette: number; // 0 to 100 (default 0)
  blur: number; // 0 to 20 (default 0)
  sharpness: number; // 0 to 100 (default 0)
}

export interface PresetFilter {
  id: string;
  name: string;
  description: string;
  adjustments: Partial<ImageAdjustments>;
}

export type LayoutType = 'hero' | 'split' | 'showcase';

export type FontStyle = 'editorial' | 'sans' | 'mono';

export interface WebsiteSettings {
  heading: string;
  subheading: string;
  ctaText: string;
  fontStyle: FontStyle;
  overlayOpacity: number;
  textColor: string;
  accentColor: string;
}
