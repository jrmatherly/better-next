/* import { dbLogger } from '@/lib/logger'; */
/* import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

// Prevent multiple instances of Redis client in development
const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

// Create Redis client
const redisClient =
  globalForRedis.redis ??
  createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  });

// Connect to Redis (will be handled on first import)
const initRedis = async () => {
  try {
    // Only connect if not already connected
    if (!redisClient.isOpen) {
      await redisClient.connect();
      // biome-ignore lint/suspicious/noConsole: allow console to prevent schema generation issues
      console.info('Redis connected successfully for session storage');
    }
  } catch (err) {
    console.warn('Redis connection failed, falling back to database only', err);
  }
};

// Initialize the connection without awaiting to prevent blocking
initRedis().catch(err => console.error('Redis initialization error', err));

// Save the instance in development to prevent multiple connections
if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redisClient;

export default redisClient;
 */
