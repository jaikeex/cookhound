import type { RecipeFlagReason } from '@/common/constants';
import type { Flag } from './_flag';

export type RecipeFlagDTO = Flag & {
    recipeId: number;
};

export type RecipeFlagPayload = {
    reason: RecipeFlagReason;
    recipeId: number;
};
