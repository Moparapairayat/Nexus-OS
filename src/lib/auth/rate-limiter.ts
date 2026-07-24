interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

/**
 * In-memory sliding window rate limiter helper for authentication endpoints.
 * Prevents brute-force credential stuffing and spam attacks.
 *
 * @param identifier Unique key (e.g. IP address or email)
 * @param maxAttempts Maximum allowed attempts per window (default: 5)
 * @param windowMs Window duration in milliseconds (default: 60,000ms = 1 minute)
 */
export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 60 * 1000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitMap.set(identifier, newEntry);
    return {
      success: true,
      remaining: maxAttempts - 1,
      resetTime: newEntry.resetTime,
    };
  }

  if (entry.count >= maxAttempts) {
    return {
      success: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  entry.count += 1;
  return {
    success: true,
    remaining: maxAttempts - entry.count,
    resetTime: entry.resetTime,
  };
}
