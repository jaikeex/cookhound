import type { RecipeFlagReason } from '@/common/constants';
import type { Flag } from './_flag';

export type RecipeFlagDTO = Flag;

export type RecipeFlagPayload = {
    reason: RecipeFlagReason;
    recipeId: number;
};
