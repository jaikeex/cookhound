import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateModelCache
} from '@/server/db/model/model-cache';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type {
    AccountDeletionRequest,
    Prisma
} from '@/server/db/generated/prisma/client';
import { ACCOUNT_DELETION_REQUEST_SELECT } from './projections';

//|=============================================================================================|//

const log = Logger.getInstance('account-deletion-request-model');

class AccountDeletionRequestModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    /**
     * Get the latest account deletion request for a user
     * Query class -> C2
     */
    async getLatestByUserId(
        userId: number,
        ttl?: number
    ): Promise<AccountDeletionRequest | null> {
        const cacheKey = generateCacheKey(
            'accountDeletionRequest',
            'findFirst',
            {
                where: { userId },
                orderBy: { requestedAt: 'desc' }
            }
        );

        log.trace('Getting latest account deletion request by userId', {
            userId
        });

        const request = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace(
                    'Fetching latest account deletion request from db by userId',
                    { userId }
                );

                return prisma.accountDeletionRequest.findFirst({
                    where: { userId },
                    orderBy: { requestedAt: 'desc' },
                    select: ACCOUNT_DELETION_REQUEST_SELECT
                });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return this.reviveDates(request);
    }

    /**
     * Get account deletion request by id
     * Query class -> C2
     */
    async getOneById(
        id: number,
        ttl?: number
    ): Promise<AccountDeletionRequest | null> {
        const cacheKey = generateCacheKey(
            'accountDeletionRequest',
            'findUnique',
            {
                where: { id }
            }
        );

        log.trace('Getting account deletion request by id', { id });

        const request = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching account deletion request from db by id', {
                    id
                });

                return prisma.accountDeletionRequest.findUnique({
                    where: { id },
                    select: ACCOUNT_DELETION_REQUEST_SELECT
                });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return this.reviveDates(request);
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    /**
     * Create a new account deletion request
     * Write class -> W3
     */
    async createOne(
        data: Prisma.AccountDeletionRequestCreateInput
    ): Promise<AccountDeletionRequest> {
        log.trace('Creating account deletion request', {
            userId: typeof data.user === 'object' ? data.user : data.user
        });

        const request = await prisma.accountDeletionRequest.create({
            data,
            select: ACCOUNT_DELETION_REQUEST_SELECT
        });

        await this.invalidateCache({ userId: request.userId });

        return request;
    }

    /**
     * Update an account deletion request by id
     * Write class -> W2
     */
    async updateOneById(
        id: number,
        data: Prisma.AccountDeletionRequestUpdateInput
    ): Promise<AccountDeletionRequest> {
        log.trace('Updating account deletion request by id', { id });

        const request = await prisma.accountDeletionRequest.update({
            where: { id },
            data,
            select: ACCOUNT_DELETION_REQUEST_SELECT
        });

        await this.invalidateCache({ id, userId: request.userId });

        return request;
    }

    /**
     * Mark deletion request as completed
     * Write class -> W2
     */
    async markAsCompleted(id: number): Promise<AccountDeletionRequest> {
        log.trace('Marking account deletion request as completed', { id });

        return this.updateOneById(id, {
            completedAt: new Date()
        });
    }

    /**
     * Mark deletion request as cancelled
     * Write class -> W2
     */
    async markAsCancelled(id: number): Promise<AccountDeletionRequest> {
        log.trace('Marking account deletion request as cancelled', { id });

        return this.updateOneById(id, {
            cancelledAt: new Date()
        });
    }

    //~=========================================================================================~//
    //$                                      PRIVATE METHODS                                    $//
    //~=========================================================================================~//

    private async invalidateCache(
        changed: Partial<AccountDeletionRequest>,
        original?: Partial<AccountDeletionRequest>
    ) {
        await invalidateModelCache(
            'accountDeletionRequest',
            changed,
            original ?? undefined
        );
    }

    /**
     * Revive date fields from the database
     */
    private reviveDates(
        request: AccountDeletionRequest | null
    ): AccountDeletionRequest | null {
        if (!request) return request;

        return {
            ...request,
            requestedAt: request.requestedAt
                ? new Date(request.requestedAt)
                : request.requestedAt,
            completedAt: request.completedAt
                ? new Date(request.completedAt)
                : request.completedAt,
            cancelledAt: request.cancelledAt
                ? new Date(request.cancelledAt)
                : request.cancelledAt
        };
    }
}

const accountDeletionRequestModel = new AccountDeletionRequestModel();
export default accountDeletionRequestModel;
