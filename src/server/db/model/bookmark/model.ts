import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateModelCache
} from '@/server/db/model/model-cache';
import type { CookbookBookmark } from '@prisma/client';

//|=============================================================================================|//

const log = Logger.getInstance('bookmark-model');

class BookmarkModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    async getBookmarksForUser(
        userId: number,
        ttl?: number
    ): Promise<CookbookBookmark[]> {
        const cacheKey = generateCacheKey('bookmark', 'findMany', {
            where: { userId },
            orderBy: { bookmarkOrder: 'asc' }
        });

        return cachePrismaQuery(
            cacheKey,
            () =>
                prisma.cookbookBookmark.findMany({
                    where: { userId },
                    orderBy: { bookmarkOrder: 'asc' }
                }),
            ttl ?? CACHE_TTL.TTL_2
        );
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    async addBookmark(
        userId: number,
        cookbookId: number,
        position?: number
    ): Promise<void> {
        log.trace('Adding bookmark', { userId, cookbookId, position });

        await prisma.$transaction(async (tx) => {
            // Determine target position
            let targetPos: number;
            if (typeof position === 'number' && position > 0) {
                targetPos = position;
                await tx.cookbookBookmark.updateMany({
                    where: {
                        userId,
                        bookmarkOrder: { gte: targetPos }
                    },
                    data: { bookmarkOrder: { increment: 1 } }
                });
            } else {
                const { _max } = await tx.cookbookBookmark.aggregate({
                    where: { userId },
                    _max: { bookmarkOrder: true }
                });
                targetPos = Number(_max.bookmarkOrder ?? 0) + 1;
            }

            await tx.cookbookBookmark.create({
                data: {
                    userId,
                    cookbookId,
                    bookmarkOrder: targetPos
                }
            });
        });

        await this.invalidateBookmarkCache({ userId });
    }

    async removeBookmark(userId: number, cookbookId: number): Promise<void> {
        log.trace('Removing bookmark', { userId, cookbookId });

        await prisma.$transaction(async (tx) => {
            const deleted = await tx.cookbookBookmark.delete({
                where: { userId_cookbookId: { userId, cookbookId } },
                select: { bookmarkOrder: true }
            });
            const deletedPos = Number(deleted.bookmarkOrder);
            await tx.cookbookBookmark.updateMany({
                where: { userId, bookmarkOrder: { gt: deletedPos } },
                data: { bookmarkOrder: { decrement: 1 } }
            });
        });

        await this.invalidateBookmarkCache({ userId });
    }

    async reorderBookmarks(
        userId: number,
        orderedCookbookIds: ReadonlyArray<number>
    ): Promise<void> {
        if (orderedCookbookIds.length === 0) return;
        log.trace('Reordering bookmarks', { userId, orderedCookbookIds });

        await prisma.$transaction(async (tx) => {
            const cases = orderedCookbookIds
                .map((id, idx) => `WHEN ${id} THEN ${idx + 1}`)
                .join(' ');
            const ids = orderedCookbookIds.join(',');
            const raw = `UPDATE "cookbook_bookmarks" SET "bookmark_order" = CASE "cookbook_id" ${cases} END WHERE "user_id" = ${userId} AND "cookbook_id" IN (${ids});`;
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            await tx.$executeRawUnsafe(raw);
        });

        await this.invalidateBookmarkCache({ userId });
    }

    //~=========================================================================================~//
    //$                                      PRIVATE METHODS                                    $//
    //~=========================================================================================~//

    private async invalidateBookmarkCache(
        changed: Partial<CookbookBookmark>,
        original?: Partial<CookbookBookmark>
    ) {
        await invalidateModelCache('bookmark', changed, original ?? undefined);
    }
}

const bookmarkModel = new BookmarkModel();
export default bookmarkModel;
