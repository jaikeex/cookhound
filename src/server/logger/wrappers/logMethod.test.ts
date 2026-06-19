import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * The decorator derives its logger context from the class. In production the
 * bundler mangles class identifiers (`UserService` -> `z`), so anything that
 * relied on `constructor.name` logged under a single letter. These tests pin
 * the resolution order that fixes that: explicit context, then a stable
 * `static LOG_CONTEXT`, then `constructor.name` as a back-compat fallback.
 */

// Capture the context each decorated method resolves to, without pulling in
// the real Winston-backed Logger.
const getInstance = vi.fn();
const logStub = {
    trace: vi.fn(),
    notice: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
};

vi.mock('@/server/logger', () => ({
    Logger: {
        getInstance: (context: string) => {
            getInstance(context);
            return logStub;
        }
    }
}));

import { LogServiceMethod } from './logMethod';

/** Mimics minification: the runtime class name differs from the source name. */
function mangleName(ctor: { new (): unknown }, mangled: string): void {
    Object.defineProperty(ctor, 'name', { value: mangled });
}

describe('LogServiceMethod context resolution', () => {
    beforeEach(() => {
        getInstance.mockClear();
    });

    it('prefers a static LOG_CONTEXT over the (mangled) class name', () => {
        class RealService {
            static readonly LOG_CONTEXT = 'real-service';

            @LogServiceMethod()
            doWork(): string {
                return 'ok';
            }
        }
        // Simulate the production minifier renaming the class to `z`.
        mangleName(RealService, 'z');

        new RealService().doWork();

        expect(getInstance).toHaveBeenCalledWith('real-service');
        expect(getInstance).not.toHaveBeenCalledWith('z');
    });

    it('lets an explicit context option win over the static field', () => {
        class RealService {
            static readonly LOG_CONTEXT = 'real-service';

            @LogServiceMethod({ context: 'override-context' })
            doWork(): string {
                return 'ok';
            }
        }

        new RealService().doWork();

        expect(getInstance).toHaveBeenCalledWith('override-context');
    });

    it('falls back to the class name when no context is declared', () => {
        class LegacyService {
            @LogServiceMethod()
            doWork(): string {
                return 'ok';
            }
        }

        new LegacyService().doWork();

        expect(getInstance).toHaveBeenCalledWith('LegacyService');
    });

    it('resolves context for async methods too', async () => {
        class RealService {
            static readonly LOG_CONTEXT = 'real-service';

            @LogServiceMethod()
            async doWork(): Promise<string> {
                return 'ok';
            }
        }
        mangleName(RealService, 'v');

        await new RealService().doWork();

        expect(getInstance).toHaveBeenCalledWith('real-service');
    });
});
