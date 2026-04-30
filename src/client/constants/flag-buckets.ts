import { RecipeFlagReason } from '@/common/constants';

/**
 * Buckets used to present flag reasons to recipe authors. We deliberately
 * collapse the precise enum the model returns into three high-level groups
 * so the user-facing copy can avoid sounding accusatory while still being
 * actionable. The exact reason is still available via a "show details"
 * disclosure on the flagged recipe page.
 */
export enum RecipeFlagBucket {
    CONTENT_POLICY = 'content-policy',
    RECIPE_QUALITY = 'recipe-quality',
    PRIVACY_SPAM = 'privacy-spam'
}

const REASON_TO_BUCKET: Record<RecipeFlagReason, RecipeFlagBucket> = {
    [RecipeFlagReason.NOT_A_RECIPE]: RecipeFlagBucket.RECIPE_QUALITY,
    [RecipeFlagReason.PROFANITY]: RecipeFlagBucket.CONTENT_POLICY,
    [RecipeFlagReason.HATE_SPEECH]: RecipeFlagBucket.CONTENT_POLICY,
    [RecipeFlagReason.HARASSMENT]: RecipeFlagBucket.CONTENT_POLICY,
    [RecipeFlagReason.VIOLENT_CONTENT]: RecipeFlagBucket.CONTENT_POLICY,
    [RecipeFlagReason.SELF_HARM]: RecipeFlagBucket.CONTENT_POLICY,
    [RecipeFlagReason.ILLEGAL_ACTIVITY]: RecipeFlagBucket.CONTENT_POLICY,
    [RecipeFlagReason.DANGEROUS_INSTRUCTION]: RecipeFlagBucket.CONTENT_POLICY,
    [RecipeFlagReason.PERSONAL_INFO]: RecipeFlagBucket.PRIVACY_SPAM,
    [RecipeFlagReason.SPAM]: RecipeFlagBucket.PRIVACY_SPAM
};

export function bucketForReason(reason: RecipeFlagReason): RecipeFlagBucket {
    return REASON_TO_BUCKET[reason] ?? RecipeFlagBucket.CONTENT_POLICY;
}
