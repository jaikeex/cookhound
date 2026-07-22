import { describe, it, expect } from 'vitest';
import { generateProofHash } from './generateProofHash';
import { serializeConsentContent } from '@/server/utils/consent';

//|=============================================================================================|//
//?                                        FIXTURES                                             ?//
//|=============================================================================================|//

/**
 * Proof hash captured from the original implementation for the inputs below.
 *
 * ! This pins the entire hashing pipeline (serialization + normalization +
 * ! SHA-256). If this test ever fails, historical consent proofs no longer
 * ! verify.
 */
const PINNED_PROOF_HASH =
    'd199c9c529bee900a2219f740912b386007ec8043bc639a94dff1e1e4e7d058d';

const PINNED_INPUT = {
    userId: 1,
    timestamp: new Date('2025-10-08T00:00:00.000Z'),
    accepted: ['analytics', 'essential']
};

//|=============================================================================================|//
//?                                          TESTS                                              ?//
//|=============================================================================================|//

describe('generateProofHash', () => {
    it('reproduces the pinned historical proof hash', () => {
        const hash = generateProofHash({
            ...PINNED_INPUT,
            text: serializeConsentContent('2025-10-08')
        });

        expect(hash).toBe(PINNED_PROOF_HASH);
    });

    it('normalizes the order of accepted categories', () => {
        const hash = generateProofHash({
            ...PINNED_INPUT,
            text: serializeConsentContent('2025-10-08'),
            accepted: ['essential', 'analytics']
        });

        expect(hash).toBe(PINNED_PROOF_HASH);
    });

    it('produces a different hash when the text changes', () => {
        const hash = generateProofHash({
            ...PINNED_INPUT,
            text: serializeConsentContent('2026-07-21')
        });

        expect(hash).not.toBe(PINNED_PROOF_HASH);
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
});
