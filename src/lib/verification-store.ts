/**
 * In-memory store for verification codes
 * In production, use Redis or a proper KV store
 */
export const verificationCodes = new Map<string, { code: string; expires: number }>();
