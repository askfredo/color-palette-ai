import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Multer file size error
  if (err.message === 'File too large') {
    res.status(413).json({
      success: false,
      error: 'File too large',
      details: 'Maximum file size is 5MB'
    });
    return;
  }

  // Multer file type error
  if (err.message === 'Only image files are allowed') {
    res.status(400).json({
      success: false,
      error: 'Invalid file type',
      details: 'Only image files are allowed'
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * 404 handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    details: `Cannot ${req.method} ${req.path}`
  });
};
