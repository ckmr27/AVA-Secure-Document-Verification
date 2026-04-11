import { db } from "./db";

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: Date;
}

/**
 * A simple rate limiter using the Database.
 * Suitable for Next.js API routes and serverless functions.
 */
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date();
  
  // Clean up old rate limit records (optional, but good practice)
  // In a high-traffic app, this should be a background task
  try {
    await db.rateLimit.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    });
  } catch (e) {
    console.error("Rate limit cleanup failed:", e);
  }

  try {
    // Transactional update to avoid race conditions
    const result = await db.$transaction(async (tx) => {
      let record = await tx.rateLimit.findUnique({
        where: { key },
      });

      if (!record || record.expiresAt < now) {
        // Create or reset record
        const expiresAt = new Date(now.getTime() + windowSeconds * 1000);
        record = await tx.rateLimit.upsert({
          where: { key },
          create: {
            key,
            attempts: 1,
            expiresAt,
          },
          update: {
            attempts: 1,
            expiresAt,
          },
        });
      } else {
        // Increment existing record
        record = await tx.rateLimit.update({
          where: { key },
          data: {
            attempts: { increment: 1 },
          },
        });
      }

      return record;
    });

    return {
      success: result.attempts <= limit,
      limit,
      remaining: Math.max(0, limit - result.attempts),
      reset: result.expiresAt,
    };
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Fail open in case of DB error to avoid blocking legitimate users, 
    // but log it. Or fail closed for high security.
    return {
      success: true, 
      limit,
      remaining: limit,
      reset: now,
    };
  }
}
