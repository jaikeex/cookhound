import { z } from 'zod';
import type { CookieConsent } from '@/common/types/cookie-consent';

type ConsentForComparison = Omit<CookieConsent, 'id' | 'userId' | 'proofHash'>;

const ConsentSchema = z.looseObject({
    createdAt: z.preprocess(
        (v) => new Date(v as string | number | Date),
        z.date()
    ),
    consent: z.boolean(),
    version: z.string(),
    accepted: z.array(
        z.enum(['essential', 'preferences', 'analytics', 'marketing'])
    )
});

export function pickMostRecentConsent(
    fromCookie: CookieConsent | null,
    fromDb: CookieConsent | null
): CookieConsent | null {
    if (!fromCookie) return fromDb;
    if (!fromDb) return fromCookie;

    const validCookie = ConsentSchema.parse(fromCookie);
    const validDb = ConsentSchema.parse(fromDb);

    const cookieTs = validCookie.createdAt.getTime();
    const dbTs = validDb.createdAt.getTime();

    // Always return a shallow copy to prevent accidental external mutation
    return dbTs > cookieTs ? { ...fromDb } : { ...fromCookie };
}

export function areConsentsEqual(
    a: ConsentForComparison | null,
    b: ConsentForComparison | null
): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;

    // version and consent check
    if (a.version !== b.version || a.consent !== b.consent) {
        return false;
    }

    // createdAt check
    const aTime =
        a.createdAt instanceof Date
            ? a.createdAt.getTime()
            : new Date(a.createdAt).getTime();
    const bTime =
        b.createdAt instanceof Date
            ? b.createdAt.getTime()
            : new Date(b.createdAt).getTime();
    if (aTime !== bTime) {
        return false;
    }

    // categories check
    if (a.accepted.length !== b.accepted.length) {
        return false;
    }
    const setA = new Set(a.accepted);
    for (const cat of b.accepted) {
        if (!setA.has(cat)) return false;
    }

    return true;
}
