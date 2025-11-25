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
    const prompt = `You are an expert in color theory and design. The user describes a color naturally.

User description: "${description}"

Your task is to interpret this description and generate a precise HEX color.

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "hex": "#RRGGBB",
  "description": "Brief explanation of the generated color and why it fits the description",
  "confidence": 0.95
}

Rules:
- The hex must be valid (format #RRGGBB)
- Confidence must be between 0 and 1
- The description must be concise (maximum 2 sentences)
- DO NOT include any additional text outside the JSON
- DO NOT use markdown, just pure JSON

Examples of descriptions and responses:

User: "A softer mint green but with pastel tone"
{
  "hex": "#B4E7CE",
  "description": "Soft mint green with pastel tones, refreshing and delicate. Combines the freshness of mint with the softness of pastels.",
  "confidence": 0.92
}

User: "A Ferrari red but slightly darker"
{
  "hex": "#B80000",
  "description": "Deep, darkened Ferrari red, maintains the characteristic intensity but with greater depth. Perfect for conveying luxury and power.",
  "confidence": 0.88
}

User: "Color that feels like 'warm sunrise at the beach'"
{
  "hex": "#FFB366",
  "description": "Warm golden orange that evokes the first rays of sun over the sea. Combines warmth, serenity and the optimism of a new day.",
  "confidence": 0.85
}

Now generate your response:`;

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
        description: parsed.description || 'AI generated color',
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
      pastel: 'soft, delicate colors with high brightness and low saturation',
      vibrant: 'vibrant, saturated, striking and energetic colors',
      vintage: 'retro, muted colors with sepia or desaturated tones',
      minimal: 'minimalist, neutral colors with reduced palette',
      flat: 'flat, modern colors typical of flat design (Material Design)',
      'web-safe': 'web-safe colors compatible with all browsers'
    };

    const prompt = `Analyze this image and extract a color palette of ${modeDescriptions[mode]}.

You must identify:
1. The DOMINANT color (the most present or important)
2. ${colorCount - 1} SECONDARY/ACCENT colors that complement the palette

Requested mode: ${mode}
Number of colors: ${colorCount}

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
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

Rules:
- Colors must follow the specified "${mode}" mode
- Percentages should add up to approximately 100
- Exactly ONE color must have role: "dominant"
- The rest can be "secondary" or "accent"
- Order by percentage descending
- DO NOT include any additional text outside the JSON
- DO NOT use markdown, just pure JSON`;

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
      professional: 'corporate, serious, trustworthy. Use blues, grays, whites.',
      luxury: 'luxurious, elegant, premium. Use blacks, golds, silvers, deep purples.',
      retro: 'retro videogame, 8-bit, nostalgic. Use saturated colors typical of the 80s-90s.',
      kawaii: 'cute, sweet, youthful. Use pinks, pastels, soft colors.',
      complementary: 'complementary (opposite colors on the color wheel)',
      analogous: 'analogous (adjacent colors on the color wheel)',
      triadic: 'triadic (three equidistant colors on the color wheel)',
      monochromatic: 'monochromatic (variations of the same hue)',
      minimal: 'minimalist, clean, simple. Use neutrals with one accent.',
      vibrant: 'vibrant, energetic, striking. Use saturated and contrasting colors.'
    };

    const baseColorInfo = baseColor ? `Base color provided: ${baseColor}` : 'No base color. Suggest colors from scratch.';

    const prompt = `You are an expert in design and color theory. Generate ${count} color palettes for the "${style}" style.

Style: ${style}
Description: ${styleDescriptions[style]}
${baseColorInfo}

${baseColor ? `You must use the color ${baseColor} as a base or inspiration for some palettes.` : ''}

IMPORTANT: Respond ONLY with a valid JSON object in this exact format:
{
  "recommendations": [
    {
      "name": "Descriptive palette name",
      "colors": [
        {"hex": "#RRGGBB"},
        {"hex": "#RRGGBB"},
        {"hex": "#RRGGBB"}
      ],
      "description": "Brief description of when to use this palette",
      "useCases": ["Use case 1", "Use case 2"]
    }
  ]
}

Rules:
- Generate exactly ${count} different palettes
- Each palette must have between 3-7 colors
- Colors must follow the "${style}" style
- Names must be creative and descriptive
- Descriptions must explain the ideal use of the palette
- DO NOT include any additional text outside the JSON
- DO NOT use markdown, just pure JSON

Examples of use cases:
- "Corporate websites"
- "Fintech mobile apps"
- "Luxury fashion brands"
- "Indie retro videogames"
- "Kawaii/cute interfaces"`;

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
