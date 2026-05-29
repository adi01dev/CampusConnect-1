import { Request, Response, NextFunction } from 'express';
import { logAuditEvent } from '../utils/auditLogger';

/**
 * Centralized security error handler middleware for Express.
 * Catches unhandled errors, logs them to MongoDB under 'SYSTEM_ERROR',
 * sanitizes production stack traces, and returns clean response messages.
 */
export const securityErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.status || err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Gather audit details
  const userId = (req as any).user?.id || null;
  const method = req.method;
  const url = req.originalUrl;
  const errorMessage = err.message || 'Unknown Server Error';
  
  const description = `${method} ${url} - Error: ${errorMessage}`;

  // Log the systemic/critical security failure
  await logAuditEvent(userId, 'SYSTEM_ERROR', description);

  // Send a sanitized JSON response
  res.status(statusCode).json({
    message: isProduction && statusCode === 500
      ? 'An internal security or system error occurred. The support team has been notified.'
      : errorMessage,
    error: true,
    ...(isProduction ? {} : { stack: err.stack })
  });
};
