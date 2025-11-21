import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIColorDescriptionResponse,
  ImagePaletteResponse,
  StyleRecommendationResponse,
  PaletteMode,
  StyleType,
  ExtractedColor,
  ColorInfo
} from '../types';
import {
  createColorInfo,
  generateColorVariations,
  isValidHex,
  normalizeHex,
  getComplementaryColor,
  getAnalogousColors,
  getTriadicColors,
  getMonochromaticPalette
} from '../utils/colorUtils';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  }

  /**
   * A. Generate color from natural language description
   */
  async generateColorFromDescription(description: string): Promise<AIColorDescriptionResponse> {
    const prompt = `Eres un experto en teoría del color y diseño. El usuario describe un color de forma natural.

Descripción del usuario: "${description}"

Tu tarea es interpretar esta descripción y generar un color HEX preciso.

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido en este formato exacto:
{
  "hex": "#RRGGBB",
  "description": "Breve explicación del color generado y por qué se ajusta a la descripción",
  "confidence": 0.95
}

Reglas:
- El hex debe ser válido (formato #RRGGBB)
- La confianza debe estar entre 0 y 1
- La descripción debe ser concisa (máximo 2 oraciones)
- NO incluyas texto adicional fuera del JSON
- NO uses markdown, solo JSON puro

Ejemplos de descripciones y respuestas:

Usuario: "Un verde menta más suave pero con tono pastel"
{
  "hex": "#B4E7CE",
  "description": "Verde menta suave con tonos pastel, refrescante y delicado. Combina la frescura del menta con la suavidad de los pasteles.",
  "confidence": 0.92
}

Usuario: "Un rojo Ferrari pero un poco más oscuro"
{
  "hex": "#B80000",
  "description": "Rojo Ferrari profundo y oscurecido, mantiene la intensidad característica pero con mayor profundidad. Perfecto para transmitir lujo y potencia.",
  "confidence": 0.88
}

Usuario: "Color que se sienta como 'amanecer cálido en la playa'"
{
  "hex": "#FFB366",
  "description": "Naranja dorado cálido que evoca los primeros rayos del sol sobre el mar. Combina calidez, serenidad y el optimismo de un nuevo día.",
  "confidence": 0.85
}

Ahora genera tu respuesta:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Clean the response
      let cleanedText = text;

      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Try to find JSON object in the response
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate the hex color
      if (!parsed.hex || !isValidHex(parsed.hex)) {
        throw new Error('Invalid hex color generated');
      }

      const normalizedHex = normalizeHex(parsed.hex);
      const colorInfo = createColorInfo(normalizedHex);
      const variations = generateColorVariations(normalizedHex);

      return {
        success: true,
        color: colorInfo,
        variations,
        description: parsed.description || 'Color generado por IA',
        confidence: parsed.confidence || 0.8
      };
    } catch (error) {
      console.error('Error generating color from description:', error);
      throw new Error(`Failed to generate color: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * B. Extract palette from image
   */
  async extractPaletteFromImage(
    imageBuffer: Buffer,
    mode: PaletteMode = 'vibrant',
    colorCount: number = 5
  ): Promise<ImagePaletteResponse> {
    // Convert image to base64
    const base64Image = imageBuffer.toString('base64');
    const mimeType = 'image/jpeg'; // Adjust based on actual image type

    const modeDescriptions: Record<PaletteMode, string> = {
      pastel: 'suaves, delicados, con alta luminosidad y baja saturación',
      vibrant: 'vibrantes, saturados, llamativos y energéticos',
      vintage: 'retro, apagados, con tonos sepia o desaturados',
      minimal: 'minimalistas, neutros, con paleta reducida',
      flat: 'planos, modernos, típicos del diseño flat (Material Design)',
      'web-safe': 'web-safe, compatibles con todos los navegadores'
    };

    const prompt = `Analiza esta imagen y extrae una paleta de colores ${modeDescriptions[mode]}.

Debes identificar:
1. El color DOMINANTE (el más presente o importante)
2. ${colorCount - 1} colores SECUNDARIOS/ACENTOS que complementen la paleta

Modo solicitado: ${mode}
Cantidad de colores: ${colorCount}

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido en este formato exacto:
{
  "palette": [
    {
      "hex": "#RRGGBB",
      "percentage": 45.5,
      "role": "dominant"
    },
    {
      "hex": "#RRGGBB",
      "percentage": 25.0,
      "role": "secondary"
    },
    {
      "hex": "#RRGGBB",
      "percentage": 15.5,
      "role": "accent"
    }
  ]
}

Reglas:
- Los colores deben seguir el modo "${mode}" especificado
- Los porcentajes deben sumar aproximadamente 100
- Exactamente UN color debe tener role: "dominant"
- El resto puede ser "secondary" o "accent"
- Ordena por porcentaje descendente
- NO incluyas texto adicional fuera del JSON
- NO uses markdown, solo JSON puro`;

    try {
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType
        }
      };

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();

      // Clean the response
      let cleanedText = text;
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.palette || !Array.isArray(parsed.palette)) {
        throw new Error('Invalid palette structure');
      }

      // Process and enrich the palette
      const enrichedPalette: ExtractedColor[] = parsed.palette.map((color: any) => {
        if (!isValidHex(color.hex)) {
          throw new Error(`Invalid hex color: ${color.hex}`);
        }

        const colorInfo = createColorInfo(color.hex);
        return {
          hex: colorInfo.hex,
          rgb: colorInfo.rgb,
          hsl: colorInfo.hsl,
          percentage: color.percentage || 0,
          role: color.role || 'secondary'
        };
      });

      return {
        success: true,
        palette: enrichedPalette,
        mode,
        totalColors: enrichedPalette.length
      };
    } catch (error) {
      console.error('Error extracting palette from image:', error);
      throw new Error(`Failed to extract palette: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * C. Generate style-based color recommendations
   */
  async generateStyleRecommendations(
    style: StyleType,
    baseColor?: string,
    count: number = 3
  ): Promise<StyleRecommendationResponse> {
    const styleDescriptions: Record<StyleType, string> = {
      professional: 'corporativa, seria, confiable. Usa azules, grises, blancos.',
      luxury: 'lujosa, elegante, premium. Usa negros, dorados, plateados, púrpuras profundos.',
      retro: 'videojuego retro, 8-bit, nostálgica. Usa colores saturados típicos de los 80s-90s.',
      kawaii: 'tierna, dulce, juvenil. Usa rosas, pasteles, colores suaves.',
      complementary: 'complementaria (colores opuestos en la rueda de color)',
      analogous: 'análoga (colores adyacentes en la rueda de color)',
      triadic: 'triádica (tres colores equidistantes en la rueda de color)',
      monochromatic: 'monocromática (variaciones del mismo tono)',
      minimal: 'minimalista, limpia, simple. Usa neutros con un acento.',
      vibrant: 'vibrante, energética, llamativa. Usa colores saturados y contrastantes.'
    };

    const baseColorInfo = baseColor ? `Color base proporcionado: ${baseColor}` : 'Sin color base. Sugiere colores desde cero.';

    const prompt = `Eres un experto en diseño y teoría del color. Genera ${count} paletas de colores para el estilo "${style}".

Estilo: ${style}
Descripción: ${styleDescriptions[style]}
${baseColorInfo}

${baseColor ? `Debes usar el color ${baseColor} como base o inspiración para algunas paletas.` : ''}

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido en este formato exacto:
{
  "recommendations": [
    {
      "name": "Nombre descriptivo de la paleta",
      "colors": [
        {"hex": "#RRGGBB"},
        {"hex": "#RRGGBB"},
        {"hex": "#RRGGBB"}
      ],
      "description": "Breve descripción de cuándo usar esta paleta",
      "useCases": ["Caso de uso 1", "Caso de uso 2"]
    }
  ]
}

Reglas:
- Genera exactamente ${count} paletas diferentes
- Cada paleta debe tener entre 3-7 colores
- Los colores deben seguir el estilo "${style}"
- Los nombres deben ser creativos y descriptivos
- Las descripciones deben explicar el uso ideal de la paleta
- NO incluyas texto adicional fuera del JSON
- NO uses markdown, solo JSON puro

Ejemplos de casos de uso:
- "Sitios web corporativos"
- "Apps móviles de fintech"
- "Marcas de moda de lujo"
- "Videojuegos indie retro"
- "Interfaces kawaii/cute"`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      // Clean the response
      let cleanedText = text;
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('Invalid recommendations structure');
      }

      // Process and enrich recommendations
      const enrichedRecommendations = parsed.recommendations.map((rec: any) => {
        const enrichedColors: ColorInfo[] = rec.colors.map((c: any) => {
          if (!isValidHex(c.hex)) {
            throw new Error(`Invalid hex color: ${c.hex}`);
          }
          return createColorInfo(c.hex);
        });

        return {
          name: rec.name || 'Unnamed Palette',
          colors: enrichedColors,
          description: rec.description || 'Color palette',
          useCases: rec.useCases || []
        };
      });

      return {
        success: true,
        style,
        recommendations: enrichedRecommendations,
        totalOptions: enrichedRecommendations.length
      };
    } catch (error) {
      console.error('Error generating style recommendations:', error);
      throw new Error(`Failed to generate recommendations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate color harmony based on color theory
   */
  async generateColorHarmony(baseColor: string, harmonyType: 'complementary' | 'analogous' | 'triadic' | 'monochromatic'): Promise<ColorInfo[]> {
    switch (harmonyType) {
      case 'complementary':
        return [createColorInfo(baseColor), getComplementaryColor(baseColor)];
      case 'analogous':
        return getAnalogousColors(baseColor);
      case 'triadic':
        return getTriadicColors(baseColor);
      case 'monochromatic':
        return getMonochromaticPalette(baseColor, 5);
      default:
        return [createColorInfo(baseColor)];
    }
  }
}
