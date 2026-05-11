export type ConsentCategory =
    | 'essential'
    | 'preferences'
    | 'analytics'
    | 'marketing';

export type CookieConsentFromBrowser = {
    consent: boolean;
    version: string;
    createdAt: Date;
    accepted: ConsentCategory[];
    userId: string | null;
};

export type CookieConsentFromDb = {
    id: string;
    userId: string;
    consent: boolean;
    version: string;
    userIpAddress: string;
    userAgent: string;
    createdAt: Date;
    revokedAt: Date | null;
    updatedAt: Date;
    proofHash: string;
    accepted: ConsentCategory[];
};

export type CookieConsentDTO = Omit<
    CookieConsentFromDb,
    'createdAt' | 'revokedAt' | 'updatedAt'
> & {
    createdAt: string;
    revokedAt: string | null;
    updatedAt: string;
};

export type CookieConsent =
    | CookieConsentFromBrowser
    | CookieConsentFromDb
    | CookieConsentDTO;

export type CookieConsentPayload = {
    consent: boolean;
    version: string;
    createdAt: Date;
    accepted: ConsentCategory[];
};

export type CookieConsentForCreate = {
    consent: boolean;
    version: string;
    createdAt: Date;
    userIpAddress: string;
    userAgent: string;
    accepted: ConsentCategory[];
    proofHash: string;
};

export type CookieConsentForVerifyDTO = {
    valid: boolean;
    details: {
        version: string;
        createdAt: Date;
        verified: Date;
        accepted: string[];
        storedHash: string;
        computedHash?: string;
    };
};
