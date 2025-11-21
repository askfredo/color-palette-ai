// Color formats
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

export interface ColorInfo {
  hex: string;
  rgb: RGB;
  hsl: HSL;
}

// Color variations
export interface ColorVariation {
  name: string;
  hex: string;
  rgb: RGB;
  hsl: HSL;
}

export interface ColorVariations {
  base: ColorInfo;
  lighter: ColorVariation;
  darker: ColorVariation;
  saturated: ColorVariation;
  desaturated: ColorVariation;
}

// AI Color Description Response
export interface AIColorDescriptionResponse {
  success: boolean;
  color: ColorInfo;
  variations: ColorVariations;
  description: string;
  confidence?: number;
}

// Image palette extraction
export type PaletteMode = 'pastel' | 'vibrant' | 'vintage' | 'minimal' | 'flat' | 'web-safe';

export interface ExtractedColor {
  hex: string;
  rgb: RGB;
  hsl: HSL;
  percentage: number;
  role: 'dominant' | 'secondary' | 'accent';
}

export interface ImagePaletteResponse {
  success: boolean;
  palette: ExtractedColor[];
  mode: PaletteMode;
  totalColors: number;
}

// Style-based recommendations
export type StyleType =
  | 'professional'
  | 'luxury'
  | 'retro'
  | 'kawaii'
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'monochromatic'
  | 'minimal'
  | 'vibrant';

export interface ColorRecommendation {
  name: string;
  colors: ColorInfo[];
  description: string;
  useCases: string[];
}

export interface StyleRecommendationResponse {
  success: boolean;
  style: StyleType;
  recommendations: ColorRecommendation[];
  totalOptions: number;
}

// Request types
export interface ColorDescriptionRequest {
  description: string;
}

export interface ImagePaletteRequest {
  mode?: PaletteMode;
  colorCount?: number;
}

export interface StyleRecommendationRequest {
  style: StyleType;
  baseColor?: string;
  count?: number;
}

// Error response
export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}
