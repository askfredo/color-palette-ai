import { Router } from 'express';
import { body } from 'express-validator';
import multer from 'multer';
import { ColorController } from '../controllers/colorController';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10) // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export function createColorRoutes(colorController: ColorController): Router {
  const router = Router();

  /**
   * POST /api/colors/generate
   * Generate color from description
   */
  router.post(
    '/generate',
    [
      body('description')
        .isString()
        .trim()
        .isLength({ min: 3, max: 500 })
        .withMessage('Description must be between 3 and 500 characters')
    ],
    colorController.generateFromDescription
  );

  /**
   * POST /api/colors/extract-palette
   * Extract palette from image
   */
  router.post(
    '/extract-palette',
    upload.single('image'),
    colorController.extractPalette
  );

  /**
   * POST /api/colors/recommendations
   * Get style-based recommendations
   */
  router.post(
    '/recommendations',
    [
      body('style')
        .isString()
        .trim()
        .isIn([
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
        ])
        .withMessage('Invalid style type'),
      body('baseColor')
        .optional()
        .isString()
        .trim()
        .matches(/^#?[0-9A-Fa-f]{6}$/)
        .withMessage('Invalid hex color format'),
      body('count')
        .optional()
        .isInt({ min: 1, max: 7 })
        .withMessage('Count must be between 1 and 7')
    ],
    colorController.getRecommendations
  );

  /**
   * GET /api/colors/health
   * Health check
   */
  router.get('/health', colorController.healthCheck);

  return router;
}
