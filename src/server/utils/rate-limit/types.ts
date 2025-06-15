export interface RateLimitConfig {
    windowSizeInSeconds: number;
    maxRequests: number;
    subWindowCount?: number;
    keyGenerator?: (identifier: string) => string;
}

export interface RateLimitResult {
    allowed: boolean;
    remainingRequests: number;
    totalRequests: number;
}

export interface RateLimiter {
    checkLimit(identifier: string): Promise<RateLimitResult>;
    resetLimit(identifier: string): Promise<void>;
}
