import { Request, Response, NextFunction } from "express";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipRequestCounts = new Map<string, RateLimitRecord>();

/**
 * Custom sliding-window IP Request Rate Limiter Middleware
 * @param limit Max requests allowed inside the window
 * @param windowMs Window duration in milliseconds (default: 15 minutes)
 */
export const rateLimiter = (limit = 100, windowMs = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Determine client IP safely, considering proxy headers
    const ip = (req.headers["x-forwarded-for"] as string) || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    const record = ipRequestCounts.get(ip);

    if (!record) {
      ipRequestCounts.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    record.count++;
    
    if (record.count > limit) {
      const timeRemaining = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", timeRemaining);
      return res.status(429).json({
        message: "Too many requests from this IP. Security throttling active. Please try again later.",
        retryAfterSeconds: timeRemaining
      });
    }

    next();
  };
};
