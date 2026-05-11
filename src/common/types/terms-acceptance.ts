export type TermsAcceptanceFromDb = {
    id: string;
    userId: string;
    version: string;
    userIpAddress: string;
    userAgent: string;
    createdAt: Date;
    revokedAt: Date | null;
    updatedAt: Date;
    proofHash: string;
};

export type TermsAcceptanceDTO = Omit<
    TermsAcceptanceFromDb,
    'createdAt' | 'revokedAt' | 'updatedAt'
> & {
    createdAt: string;
    revokedAt: string | null;
    updatedAt: string;
};

export type TermsAcceptancePayload = {
    version: string;
    createdAt: Date;
};

export type TermsAcceptanceForCreate = {
    version: string;
    createdAt: Date;
    userIpAddress: string;
    userAgent: string;
    proofHash: string;
};

export type TermsAcceptanceForVerifyDTO = {
    valid: boolean;
    details: {
        version: string;
        createdAt: Date;
        verified: Date;
        storedHash: string;
        computedHash?: string;
    };
};
