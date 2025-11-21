/**
 * Cliente TypeScript para Color Palette AI API
 * Ejemplo de implementación para React/Next.js
 *
 * Copia este archivo a tu proyecto frontend y úsalo como referencia
 */

// ============= TIPOS =============

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

export interface AIColorDescriptionResponse {
  success: boolean;
  color: ColorInfo;
  variations: ColorVariations;
  description: string;
  confidence?: number;
}

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

export interface ErrorResponse {
  success: false;
  error: string;
  details?: string;
}

// ============= CLIENTE API =============

export class ColorPaletteAPI {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3001/api/colors') {
    this.baseURL = baseURL;
  }

  /**
   * Generar color desde descripción natural
   */
  async generateColor(description: string): Promise<AIColorDescriptionResponse> {
    const response = await fetch(`${this.baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to generate color');
    }

    return data;
  }

  /**
   * Extraer paleta desde imagen
   */
  async extractPalette(
    imageFile: File,
    mode: PaletteMode = 'vibrant',
    colorCount: number = 5
  ): Promise<ImagePaletteResponse> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('mode', mode);
    formData.append('colorCount', colorCount.toString());

    const response = await fetch(`${this.baseURL}/extract-palette`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to extract palette');
    }

    return data;
  }

  /**
   * Obtener recomendaciones por estilo
   */
  async getRecommendations(
    style: StyleType,
    baseColor?: string,
    count: number = 3
  ): Promise<StyleRecommendationResponse> {
    const response = await fetch(`${this.baseURL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ style, baseColor, count }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'Failed to get recommendations');
    }

    return data;
  }

  /**
   * Health check del servidor
   */
  async healthCheck(): Promise<{ success: boolean; message: string; timestamp: string }> {
    const response = await fetch(`${this.baseURL}/health`);
    return response.json();
  }
}

// ============= HOOKS DE REACT (EJEMPLO) =============

/**
 * Hook personalizado para usar el API de colores
 */
export function useColorPalette() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const api = useMemo(() => new ColorPaletteAPI(), []);

  const generateColor = async (description: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateColor(description);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const extractPalette = async (
    imageFile: File,
    mode: PaletteMode = 'vibrant',
    colorCount: number = 5
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.extractPalette(imageFile, mode, colorCount);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async (
    style: StyleType,
    baseColor?: string,
    count: number = 3
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getRecommendations(style, baseColor, count);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateColor,
    extractPalette,
    getRecommendations,
    loading,
    error,
  };
}

// ============= COMPONENTES DE EJEMPLO =============

/**
 * Componente de ejemplo: Generador de color
 */
export function ColorGenerator() {
  const [description, setDescription] = useState('');
  const [result, setResult] = useState<AIColorDescriptionResponse | null>(null);
  const { generateColor, loading, error } = useColorPalette();

  const handleGenerate = async () => {
    if (!description.trim()) return;

    try {
      const color = await generateColor(description);
      setResult(color);
    } catch (err) {
      console.error('Error generating color:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Describe tu color
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Un verde menta suave con tono pastel"
          className="w-full px-4 py-2 border rounded-lg"
          disabled={loading}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !description.trim()}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? 'Generando...' : 'Generar Color'}
      </button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="p-4 border rounded-lg">
            <div
              className="w-full h-32 rounded-lg mb-4"
              style={{ backgroundColor: result.color.hex }}
            />
            <div className="space-y-2">
              <p className="text-sm">
                <strong>HEX:</strong> {result.color.hex}
              </p>
              <p className="text-sm">
                <strong>RGB:</strong> rgb({result.color.rgb.r}, {result.color.rgb.g}, {result.color.rgb.b})
              </p>
              <p className="text-sm">
                <strong>HSL:</strong> hsl({result.color.hsl.h}, {result.color.hsl.s}%, {result.color.hsl.l}%)
              </p>
              <p className="text-sm text-gray-600">{result.description}</p>
              {result.confidence && (
                <p className="text-xs text-gray-500">
                  Confianza: {(result.confidence * 100).toFixed(0)}%
                </p>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Variaciones</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(result.variations).map(([key, variation]) => {
                if (key === 'base') return null;
                return (
                  <div key={key} className="border rounded p-2">
                    <div
                      className="w-full h-16 rounded mb-2"
                      style={{ backgroundColor: variation.hex }}
                    />
                    <p className="text-xs font-medium">{variation.name}</p>
                    <p className="text-xs text-gray-500">{variation.hex}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Componente de ejemplo: Extractor de paleta
 */
export function PaletteExtractor() {
  const [result, setResult] = useState<ImagePaletteResponse | null>(null);
  const [mode, setMode] = useState<PaletteMode>('vibrant');
  const { extractPalette, loading, error } = useColorPalette();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const palette = await extractPalette(file, mode, 5);
      setResult(palette);
    } catch (err) {
      console.error('Error extracting palette:', err);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Subir imagen
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={loading}
          className="w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Modo de extracción
        </label>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value as PaletteMode)}
          className="w-full px-4 py-2 border rounded-lg"
          disabled={loading}
        >
          <option value="vibrant">Vibrante</option>
          <option value="pastel">Pastel</option>
          <option value="vintage">Vintage</option>
          <option value="minimal">Minimal</option>
          <option value="flat">Flat</option>
          <option value="web-safe">Web Safe</option>
        </select>
      </div>

      {loading && <p className="text-sm text-gray-600">Analizando imagen...</p>}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {result.palette.map((color, index) => (
              <div key={index} className="flex-1">
                <div
                  className="w-full h-24 rounded"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-xs mt-1 font-medium">{color.role}</p>
                <p className="text-xs text-gray-600">{color.hex}</p>
                <p className="text-xs text-gray-500">{color.percentage.toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============= EJEMPLO DE USO =============

/*
// En tu componente React:

import { ColorPaletteAPI, useColorPalette, ColorGenerator, PaletteExtractor } from './client-example';

function App() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Color Palette AI</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Generar Color</h2>
          <ColorGenerator />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Extraer Paleta</h2>
          <PaletteExtractor />
        </div>
      </div>
    </div>
  );
}
*/
