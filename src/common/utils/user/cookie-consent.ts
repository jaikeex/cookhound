import type { CookieConsent } from '@/common/types/cookie-consent';

type ConsentForComparison = Omit<CookieConsent, 'id' | 'userId' | 'proofHash'>;

export function areConsentsEqual(
    a: ConsentForComparison | null,
    b: ConsentForComparison | null
): boolean {
    if (!a && !b) return true;
    if (!a || !b) return false;

    if (a.version !== b.version || a.consent !== b.consent) {
        return false;
    }

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

    if (a.accepted.length !== b.accepted.length) {
        return false;
    }
    const setA = new Set(a.accepted);
    for (const cat of b.accepted) {
        if (!setA.has(cat)) return false;
    }

    return true;
}
