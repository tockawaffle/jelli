import { Redis } from "@upstash/redis";

// Only initialize Redis if we have the required environment variables
// This prevents build-time errors when Redis env vars aren't available
let redis: Redis;

if (typeof globalThis !== 'undefined' && globalThis._betterAuthRedis) {
	redis = globalThis._betterAuthRedis;
} else {
	try {
		// Check if we have the required environment variables
		if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
			console.log('[Redis] Redis initialization successful');
			redis = Redis.fromEnv();
			if (typeof globalThis !== 'undefined') {
				globalThis._betterAuthRedis = redis;
			}
		} else {
			console.warn('[Redis] Redis initialization failed, using mock instance');
			// Create a mock Redis instance for build time
			redis = {
				get: async () => null,
				set: async () => 'OK',
				del: async () => 1,
			} as any;
		}
	} catch (error) {
		console.warn('Redis initialization failed, using mock instance:', error);
		// Fallback mock for build time
		redis = {
			get: async () => null,
			set: async () => 'OK',
			del: async () => 1,
		} as any;
	}
}

export default redis;
