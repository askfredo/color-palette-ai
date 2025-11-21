import { RGB, HSL, ColorInfo, ColorVariations } from '../types';

/**
 * Normalize hex color string
 */
export function normalizeHex(hex: string): string {
  hex = hex.replace(/^#/, '').toUpperCase();

  // Convert 3-digit hex to 6-digit
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  return `#${hex}`;
}

/**
 * Validate hex color
 */
export function isValidHex(hex: string): boolean {
  const normalized = hex.replace(/^#/, '');
  return /^[0-9A-Fa-f]{6}$/.test(normalized) || /^[0-9A-Fa-f]{3}$/.test(normalized);
}

/**
 * Convert HEX to RGB
 */
export function hexToRgb(hex: string): RGB {
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return { r, g, b };
}

/**
 * Convert RGB to HEX
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`.toUpperCase();
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(rgb: RGB): HSL {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === r) {
      h = ((g - b) / delta + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / delta + 2) / 6;
    } else {
      h = ((r - g) / delta + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const h = hsl.h / 360;
  const s = hsl.s / 100;
  const l = hsl.l / 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  };
}

/**
 * Convert HEX to HSL
 */
export function hexToHsl(hex: string): HSL {
  const rgb = hexToRgb(hex);
  return rgbToHsl(rgb);
}

/**
 * Convert HSL to HEX
 */
export function hslToHex(hsl: HSL): string {
  const rgb = hslToRgb(hsl);
  return rgbToHex(rgb);
}

/**
 * Create ColorInfo object from hex
 */
export function createColorInfo(hex: string): ColorInfo {
  const normalized = normalizeHex(hex);
  const rgb = hexToRgb(normalized);
  const hsl = rgbToHsl(rgb);

  return { hex: normalized, rgb, hsl };
}

/**
 * Generate color variations
 */
export function generateColorVariations(hex: string): ColorVariations {
  const base = createColorInfo(hex);
  const { h, s, l } = base.hsl;

  // Lighter variation (+20% lightness)
  const lighterHsl: HSL = { h, s, l: Math.min(100, l + 20) };
  const lighterHex = hslToHex(lighterHsl);

  // Darker variation (-20% lightness)
  const darkerHsl: HSL = { h, s, l: Math.max(0, l - 20) };
  const darkerHex = hslToHex(darkerHsl);

  // More saturated (+20% saturation)
  const saturatedHsl: HSL = { h, s: Math.min(100, s + 20), l };
  const saturatedHex = hslToHex(saturatedHsl);

  // Less saturated (-20% saturation)
  const desaturatedHsl: HSL = { h, s: Math.max(0, s - 20), l };
  const desaturatedHex = hslToHex(desaturatedHsl);

  return {
    base,
    lighter: {
      name: 'Lighter',
      ...createColorInfo(lighterHex)
    },
    darker: {
      name: 'Darker',
      ...createColorInfo(darkerHex)
    },
    saturated: {
      name: 'More Saturated',
      ...createColorInfo(saturatedHex)
    },
    desaturated: {
      name: 'Less Saturated',
      ...createColorInfo(desaturatedHex)
    }
  };
}

/**
 * Get complementary color (180° on color wheel)
 */
export function getComplementaryColor(hex: string): ColorInfo {
  const hsl = hexToHsl(hex);
  const complementaryHsl: HSL = {
    h: (hsl.h + 180) % 360,
    s: hsl.s,
    l: hsl.l
  };
  return createColorInfo(hslToHex(complementaryHsl));
}

/**
 * Get analogous colors (±30° on color wheel)
 */
export function getAnalogousColors(hex: string): ColorInfo[] {
  const hsl = hexToHsl(hex);

  const analogous1: HSL = { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l };
  const analogous2: HSL = { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l };

  return [
    createColorInfo(hslToHex(analogous1)),
    createColorInfo(hex),
    createColorInfo(hslToHex(analogous2))
  ];
}

/**
 * Get triadic colors (120° apart on color wheel)
 */
export function getTriadicColors(hex: string): ColorInfo[] {
  const hsl = hexToHsl(hex);

  const triadic1: HSL = { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l };
  const triadic2: HSL = { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l };

  return [
    createColorInfo(hex),
    createColorInfo(hslToHex(triadic1)),
    createColorInfo(hslToHex(triadic2))
  ];
}

/**
 * Generate monochromatic palette (same hue, different lightness)
 */
export function getMonochromaticPalette(hex: string, count: number = 5): ColorInfo[] {
  const hsl = hexToHsl(hex);
  const colors: ColorInfo[] = [];

  for (let i = 0; i < count; i++) {
    const lightness = 20 + (60 / (count - 1)) * i;
    const monoHsl: HSL = { h: hsl.h, s: hsl.s, l: Math.round(lightness) };
    colors.push(createColorInfo(hslToHex(monoHsl)));
  }

  return colors;
}

/**
 * Calculate relative luminance (for accessibility)
 */
export function getRelativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex);

  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(hex1: string, hex2: string): number {
  const lum1 = getRelativeLuminance(hex1);
  const lum2 = getRelativeLuminance(hex2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}
