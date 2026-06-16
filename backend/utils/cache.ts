import NodeCache from 'node-cache';

// TTL = 360 seconds (6 minutes)
export const cache = new NodeCache({ stdTTL: 360, checkperiod: 60 });

// Helper to invalidate cache keys when writes occur
export const invalidateCachePrefix = (prefix: string) => {
  const keys = cache.keys();
  keys.forEach((key) => {
    if (key.includes(prefix)) {
      cache.del(key);
    }
  });
};
