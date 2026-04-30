export enum RecipeFlagAppealStatus {
    PENDING = 'pending',
    UPHELD = 'upheld',
    OVERTURNED = 'overturned'
}

export type RecipeFlagAppealDTO = {
    id: number;
    flagId: number;
    userId: number;
    message: string;
    status: RecipeFlagAppealStatus;
    reviewedById: number | null;
    reviewedAt: Date | null;
    createdAt: Date;
};

export type RecipeFlagAppealPayload = {
    flagId: number;
    message: string;
};
