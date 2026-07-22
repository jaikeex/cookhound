import { describe, it, expect } from 'vitest';
import { ntfyMessages } from './messages';
import type { NtfyNotificationJobData } from './types';

//|=============================================================================================|//

/**
 * Titles are sent as an HTTP header and undici rejects non-latin1 header
 * values, so every title must be plain printable ASCII. This regex pins
 * that contract for all builders at once.
 */
const ASCII_PRINTABLE = /^[\x20-\x7e]+$/;

const LONG_INPUT = 'ř'.repeat(500);

/**
 * One invocation per builder so new events cannot be added without also
 * being covered here (the length assertion below enforces it).
 */
const SAMPLE_INVOCATIONS: Record<string, () => NtfyNotificationJobData> = {
    newUser: () => ntfyMessages.newUser(),
    newRecipe: () => ntfyMessages.newRecipe('Svíčková na smetaně'),
    recipeFlagged: () =>
        ntfyMessages.recipeFlagged('Svíčková na smetaně', 'spam'),
    recipeReinstated: () =>
        ntfyMessages.recipeReinstated('Svíčková na smetaně', 2),
    flagAppealCreated: () =>
        ntfyMessages.flagAppealCreated({
            appealId: 3,
            recipeTitle: 'Svíčková na smetaně',
            flagReason: 'spam'
        }),
    accountDeletionRequested: () => ntfyMessages.accountDeletionRequested(true)
};

//|=============================================================================================|//

describe('ntfyMessages', () => {
    it('covers every builder in the catalog', () => {
        expect(Object.keys(SAMPLE_INVOCATIONS).sort()).toEqual(
            Object.keys(ntfyMessages).sort()
        );
    });

    describe.each(Object.entries(SAMPLE_INVOCATIONS))('%s', (_name, invoke) => {
        it('produces a valid ntfy payload', () => {
            const payload = invoke();

            expect(payload.event).toBeTruthy();
            expect(payload.title).toMatch(ASCII_PRINTABLE);
            expect(payload.message.length).toBeGreaterThan(0);
            expect(payload.priority).toBeGreaterThanOrEqual(1);
            expect(payload.priority).toBeLessThanOrEqual(5);
            expect(payload.tags?.length).toBeGreaterThan(0);
        });
    });

    it('interpolates dynamic arguments into the message body, not the title', () => {
        const payload = ntfyMessages.recipeFlagged('Guláš', 'spam');

        expect(payload.message).toContain('Guláš');
        expect(payload.message).toContain('spam');
        expect(payload.title).not.toContain('Guláš');
    });

    it('truncates user-supplied strings to a bounded length', () => {
        const payload = ntfyMessages.newRecipe(LONG_INPUT);

        // 200 chars + ellipsis + surrounding template text stays well
        // below the raw 500-char input.
        expect(payload.message.length).toBeLessThan(250);
        expect(payload.message).toContain('…');
    });

    it('marks the deletion reason presence without leaking its content', () => {
        const withReason = ntfyMessages.accountDeletionRequested(true);
        const withoutReason = ntfyMessages.accountDeletionRequested(false);

        expect(withReason.message).toContain('reason given');
        expect(withoutReason.message).not.toContain('reason given');
    });
});
