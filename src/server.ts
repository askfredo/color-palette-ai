import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { GeminiService } from './services/geminiService';
import { ColorController } from './controllers/colorController';
import { createColorRoutes } from './routes/colorRoutes';
import { errorHandler, notFoundHandler } from './utils/validators';

// Load environment variables
dotenv.config();

class Server {
  private app: Application;
  private port: number;
  private geminiService: GeminiService;
  private colorController: ColorController;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3001', 10);

    // Validate required environment variables
    this.validateEnvironment();

    // Initialize services
    this.geminiService = new GeminiService(process.env.GEMINI_API_KEY!);
    this.colorController = new ColorController(this.geminiService);

    // Setup middleware
    this.setupMiddleware();

    // Setup routes
    this.setupRoutes();

    // Setup error handlers
    this.setupErrorHandlers();
  }

  private validateEnvironment(): void {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
  }

  private setupMiddleware(): void {
    // Security headers
    this.app.use(helmet());

    // CORS configuration
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
    this.app.use(
      cors({
        origin: (origin, callback) => {
          // Allow requests with no origin (like mobile apps or curl)
          if (!origin) return callback(null, true);

          if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        credentials: true
      })
    );

    // Body parsers
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }
  }

  private setupRoutes(): void {
    // Health check
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Color Palette AI API',
        version: '1.0.0',
        endpoints: {
          health: 'GET /api/colors/health',
          generateColor: 'POST /api/colors/generate',
          extractPalette: 'POST /api/colors/extract-palette',
          recommendations: 'POST /api/colors/recommendations'
        }
      });
    });

    // API routes
    this.app.use('/api/colors', createColorRoutes(this.colorController));
  }

  private setupErrorHandlers(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public start(): void {
    this.app.listen(this.port, () => {
      console.log('┌─────────────────────────────────────────────┐');
      console.log('│                                             │');
      console.log('│   🎨 Color Palette AI Backend API          │');
      console.log('│                                             │');
      console.log('└─────────────────────────────────────────────┘');
      console.log('');
      console.log(`Server running on port: ${this.port}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`API Base URL: http://localhost:${this.port}/api/colors`);
      console.log('');
      console.log('Available endpoints:');
      console.log(`  • GET  /api/colors/health`);
      console.log(`  • POST /api/colors/generate`);
      console.log(`  • POST /api/colors/extract-palette`);
      console.log(`  • POST /api/colors/recommendations`);
      console.log('');
      console.log('Press Ctrl+C to stop the server');
      console.log('');
    });
  }
}

// Start the server
const server = new Server();
server.start();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  process.exit(0);
});
