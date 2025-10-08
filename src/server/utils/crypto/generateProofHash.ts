import { createHash } from 'crypto';

export type ProofHashInput = Readonly<{
    text: string;
    userId: number;
    timestamp: Date;
    accepted?: string[];
}>;

/**
 * Generates a SHA-256 hash from structured acceptance/consent data.
 *
 * @param input - Structured input containing text, userId, timestamp, and optional accepted categories
 * @returns SHA-256 hash as a hexadecimal string
 */
export function generateProofHash(input: ProofHashInput): string {
    // Normalize the data to ensure consistent hashing
    const normalizedData = {
        text: input.text.trim(),
        userId: input.userId,
        timestamp: input.timestamp.toISOString(),
        accepted: input.accepted?.slice().sort()
    };

    const dataString = JSON.stringify(
        normalizedData,
        Object.keys(normalizedData).sort()
    );

    const hash = createHash('sha256');
    hash.update(dataString);

    return hash.digest('hex');
}
