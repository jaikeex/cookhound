import { Logger, LogServiceMethod } from '@/server/logger';
import type { Cookbook } from '@prisma/client';
import type { CookbookForCreate } from './types';
import type { CookbookForCreatePayload, CookbookDTO } from '@/common/types';
import { assertAuthenticated } from '@/server/utils/reqwest';
import { randomUUID } from 'crypto';
import { DEFAULT_LOCALE } from '@/common/constants';
import { RequestContext } from '@/server/utils/reqwest/context';
import db from '@/server/db/model';
import { NotFoundError, ServerError } from '@/server/error';
import { InfrastructureErrorCode } from '@/server/error/codes';
import { createCookbookDTO, verifyCookbookOwnership } from './utils';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('cookbook-service');

/**
 * Service class for managing cookbooks.
 */
class CookbookService {
    @LogServiceMethod({ names: ['id'] })
    async getCookbookById(id: number): Promise<CookbookDTO> {
        const cookbook = await db.cookbook.getOneById(id);

        if (!cookbook) {
            log.warn('getCookbookById - cookbook not found', { id });
            throw new NotFoundError();
        }

        const cookbookDTO = createCookbookDTO(cookbook);

        return cookbookDTO;
    }

    @LogServiceMethod({ names: ['displayId'] })
    async getCookbookByDisplayId(displayId: string): Promise<CookbookDTO> {
        const cookbook = await db.cookbook.getOneByDisplayId(displayId);

        if (!cookbook) {
            throw new NotFoundError();
        }

        return createCookbookDTO(cookbook);
    }

    @LogServiceMethod({ names: ['ownerId'] })
    async getCookbooksByOwnerId(ownerId: number): Promise<CookbookDTO[]> {
        const cookbooks = await db.cookbook.getManyByOwnerId(ownerId);

        return cookbooks.map((cookbook) => createCookbookDTO(cookbook));
    }

    @LogServiceMethod({ names: ['payload'] })
    async createCookbook(payload: CookbookForCreatePayload): Promise<Cookbook> {
        const userId = assertAuthenticated();

        const language = RequestContext.getUserLocale() ?? DEFAULT_LOCALE;

        const displayId = randomUUID();

        const cookbookForCreate: CookbookForCreate = {
            displayId,
            ownerId: userId,
            title: payload.title,
            description: payload.description,
            visibility: payload.visibility,
            language: language
        };

        const cookbook = await db.cookbook.createOne(cookbookForCreate);

        return cookbook;
    }

    @LogServiceMethod({ names: ['cookbookId'] })
    async deleteCookbook(cookbookId: number): Promise<void> {
        await verifyCookbookOwnership(cookbookId);

        await db.cookbook.deleteOne(cookbookId);
    }

    @LogServiceMethod({ names: ['cookbookId', 'recipeId'] })
    async addRecipeToCookbook(
        cookbookId: number,
        recipeId: number
    ): Promise<{ success: boolean }> {
        await verifyCookbookOwnership(cookbookId);

        try {
            await db.cookbook.addRecipeToCookbook(cookbookId, recipeId);

            return { success: true };
        } catch (error: unknown) {
            if (
                error instanceof ServerError &&
                error.code === InfrastructureErrorCode.DB_CONSTRAINT_VIOLATION
            ) {
                /**
                 * User tried to add a recipe to a cookbook that already contains it.
                 * This should be handled on the client, but if a request like this slips by,
                 * we should still return a success response. The route can handle it as it sees fit,
                 * the same goes for the client.
                 */

                return { success: false };
            }

            throw error;
        }
    }

    @LogServiceMethod({ names: ['cookbookId', 'recipeId'] })
    async removeRecipeFromCookbook(
        cookbookId: number,
        recipeId: number
    ): Promise<void> {
        await verifyCookbookOwnership(cookbookId);

        await db.cookbook.removeRecipeFromCookbook(cookbookId, recipeId);
    }

    @LogServiceMethod({ names: ['cookbookId', 'orderedRecipeIds'] })
    async reorderCookbookRecipes(
        cookbookId: number,
        orderedRecipeIds: number[]
    ): Promise<void> {
        await verifyCookbookOwnership(cookbookId);

        await db.cookbook.reorderCookbookRecipes(cookbookId, orderedRecipeIds);
    }

    @LogServiceMethod({ names: ['ownerId', 'orderedCookbookIds'] })
    async reorderOwnCookbooks(
        ownerId: number,
        orderedCookbookIds: number[]
    ): Promise<void> {
        await db.cookbook.reorderOwnCookbooks(ownerId, orderedCookbookIds);
    }
}

export const cookbookService = new CookbookService();
