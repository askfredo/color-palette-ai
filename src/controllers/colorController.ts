import { Request, Response } from 'express';
import { GeminiService } from '../services/geminiService';
import { validationResult } from 'express-validator';
import {
  ColorDescriptionRequest,
  ImagePaletteRequest,
  StyleRecommendationRequest,
  ErrorResponse
} from '../types';

export class ColorController {
  private geminiService: GeminiService;

  constructor(geminiService: GeminiService) {
    this.geminiService = geminiService;
  }

  /**
   * POST /api/colors/generate
   * Generate color from natural language description
   */
  generateFromDescription = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: JSON.stringify(errors.array())
        } as ErrorResponse);
        return;
      }

      const { description } = req.body as ColorDescriptionRequest;

      if (!description || description.trim().length === 0) {
        res.status(400).json({
          success: false,
          error: 'Description is required'
        } as ErrorResponse);
        return;
      }

      // Generate color using AI
      const result = await this.geminiService.generateColorFromDescription(description);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in generateFromDescription:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate color',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as ErrorResponse);
    }
  };

  /**
   * POST /api/colors/extract-palette
   * Extract color palette from uploaded image
   */
  extractPalette = async (req: Request, res: Response): Promise<void> => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'No image file uploaded'
        } as ErrorResponse);
        return;
      }

      const { mode = 'vibrant', colorCount = 5 } = req.body as ImagePaletteRequest;

      // Validate mode
      const validModes = ['pastel', 'vibrant', 'vintage', 'minimal', 'flat', 'web-safe'];
      if (!validModes.includes(mode)) {
        res.status(400).json({
          success: false,
          error: `Invalid mode. Must be one of: ${validModes.join(', ')}`
        } as ErrorResponse);
        return;
      }

      // Validate colorCount
      const count = parseInt(colorCount as any, 10);
      if (isNaN(count) || count < 2 || count > 10) {
        res.status(400).json({
          success: false,
          error: 'colorCount must be between 2 and 10'
        } as ErrorResponse);
        return;
      }

      // Extract palette using AI
      const result = await this.geminiService.extractPaletteFromImage(
        req.file.buffer,
        mode,
        count
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in extractPalette:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to extract palette',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as ErrorResponse);
    }
  };

  /**
   * POST /api/colors/recommendations
   * Get AI-powered style-based color recommendations
   */
  getRecommendations = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: JSON.stringify(errors.array())
        } as ErrorResponse);
        return;
      }

      const { style, baseColor, count = 3 } = req.body as StyleRecommendationRequest;

      // Validate style
      const validStyles = [
        'professional',
        'luxury',
        'retro',
        'kawaii',
        'complementary',
        'analogous',
        'triadic',
        'monochromatic',
        'minimal',
        'vibrant'
      ];

      if (!style || !validStyles.includes(style)) {
        res.status(400).json({
          success: false,
          error: `Invalid style. Must be one of: ${validStyles.join(', ')}`
        } as ErrorResponse);
        return;
      }

      // Validate count
      const recommendationCount = parseInt(count as any, 10);
      if (isNaN(recommendationCount) || recommendationCount < 1 || recommendationCount > 7) {
        res.status(400).json({
          success: false,
          error: 'count must be between 1 and 7'
        } as ErrorResponse);
        return;
      }

      // Generate recommendations using AI
      const result = await this.geminiService.generateStyleRecommendations(
        style,
        baseColor,
        recommendationCount
      );

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getRecommendations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      } as ErrorResponse);
    }
  };

  /**
   * GET /api/colors/health
   * Health check endpoint
   */
  healthCheck = async (_req: Request, res: Response): Promise<void> => {
    res.status(200).json({
      success: true,
      message: 'Color Palette AI API is running',
      timestamp: new Date().toISOString()
    });
  };
}
