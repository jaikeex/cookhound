import { typesenseClient } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type { RecipeDTO, RecipeForDisplayDTO } from '@/common/types';
import type { Locale } from '@/client/locales';
import { redisClient } from '@/server/integrations';
import { InfrastructureError } from '@/server/error';
import { InfrastructureErrorCode } from '@/server/error/codes';
import { CACHE_TTL } from '@/server/db/model/model-cache';

const log = Logger.getInstance('recipe-index');

const COLLECTION_NAME = 'recipes';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                         ISFLAGGED                                           ?//
///
//# There is no need to save all recipe flags to the index. For start, the api should already
//# manage flagged recipes by deleting them from the index and keeping it up to date, but in case
//# any flagged recipe slips through, this field exists. Simply record whether the recipe has
//# any active flags. This is easier for the client to check when rendering lists and any additional
//# info can always be queried for later.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

interface RecipeDocument {
    id: string;
    displayId: string;
    language: Locale;
    title: string;
    notes: string | null;
    ingredients: string[];
    instructions: string[];
    rating: number | null;
    isFlagged: number;
    timesRated: number;
    time: number | null;
    portionSize: number | null;
    authorId: number;
    imageUrl: string | null;
}

class RecipeSearchIndex {
    private static instance: RecipeSearchIndex | null = null;
    private client: any;
    private collectionReady: boolean = false;

    private constructor() {
        this.client = typesenseClient.getClient();
    }

    static getInstance(): RecipeSearchIndex {
        if (!RecipeSearchIndex.instance) {
            RecipeSearchIndex.instance = new RecipeSearchIndex();
        }
        return RecipeSearchIndex.instance;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                          CACHE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    private generateSearchCacheKey(
        query: string,
        language: Locale,
        limit: number,
        offset: number
    ): string {
        return `typesense:recipe:search:${JSON.stringify({
            query: query.trim().toLowerCase(),
            language,
            limit,
            offset
        })}`;
    }

    private async cacheSearchQuery<T>(
        cacheKey: string,
        queryFn: () => Promise<T>,
        ttlInSeconds: number = CACHE_TTL.TTL_1
    ): Promise<T> {
        const startTime = Date.now();

        try {
            const cachedResult = await redisClient.get<T>(cacheKey);

            if (cachedResult !== null) {
                const fetchTime = Date.now() - startTime;

                log.trace('Cache hit for search query', {
                    cacheKey,
                    fetchTime: `${fetchTime}ms`
                });

                return cachedResult;
            }

            log.trace('Cache miss for search query', { cacheKey });

            const result = await queryFn();

            await redisClient.set(cacheKey, result, ttlInSeconds);

            const fetchTime = Date.now() - startTime;

            log.trace('Search query executed and cached', {
                cacheKey,
                fetchTime: `${fetchTime}ms`
            });

            return result;
        } catch (error: unknown) {
            log.error('Cache operation failed for search query', error, {
                cacheKey
            });

            return await queryFn();
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    CREATE COLLECTION                                    $//
    //~-----------------------------------------------------------------------------------------~//

    private async ensureCollectionExists(): Promise<void> {
        if (this.collectionReady) {
            return;
        }

        try {
            await this.client.collections(COLLECTION_NAME).retrieve();
            this.collectionReady = true;
            return;
        } catch (error: unknown) {
            /**
             * This explicit check is needed to detect when the collection is not present in typesense.
             * The any is needed here because typesense does not care about typescript.
             */
            const isNotFound =
                (error as any)?.httpStatus === 404 ||
                (error as any)?.name === 'ObjectNotFound' ||
                (error as any)?.code === 404;

            if (!isNotFound) {
                log.error('Failed to retrieve Typesense collection', error);
                throw new InfrastructureError(
                    InfrastructureErrorCode.TYPESENSE_COLLECTION_CREATE_FAILED
                );
            }
        }

        log.info('Typesense collection not found – creating…');

        try {
            await this.client.collections().create({
                name: COLLECTION_NAME,
                fields: [
                    { name: 'id', type: 'string' },
                    { name: 'displayId', type: 'string' },
                    { name: 'language', type: 'string' },
                    { name: 'title', type: 'string' },
                    { name: 'notes', type: 'string', optional: true },
                    { name: 'ingredients', type: 'string[]', optional: true },
                    { name: 'instructions', type: 'string[]', optional: true },
                    { name: 'rating', type: 'float', optional: true },
                    { name: 'timesRated', type: 'int32', optional: true },
                    { name: 'isFlagged', type: 'int32', optional: true },
                    { name: 'time', type: 'int32', optional: true },
                    { name: 'portionSize', type: 'int32', optional: true },
                    { name: 'authorId', type: 'int32' },
                    { name: 'imageUrl', type: 'string', optional: true }
                ]
            });

            this.collectionReady = true;

            log.info('Typesense recipe collection created successfully');
        } catch (error: unknown) {
            /**
             * Throw the error here.
             * There is no reasonable reason for this to ever happen, and the collection will be
             * present already anyway, so failure here is some shitty magic that needs to be seen.
             */
            log.error('Failed to create Typesense collection', error);
            throw new InfrastructureError(
                InfrastructureErrorCode.TYPESENSE_COLLECTION_CREATE_FAILED
            );
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         MAPPING                                         $//
    //~-----------------------------------------------------------------------------------------~//

    private mapRecipeToDocument(recipe: RecipeDTO): RecipeDocument {
        return {
            id: recipe.id.toString(),
            displayId: recipe.displayId,
            language: recipe.language,
            title: recipe.title,
            notes: recipe.notes ?? '',
            ingredients: recipe.ingredients?.map((i) => i.name) ?? [],
            instructions: recipe.instructions ?? [],
            rating: recipe.rating ?? null,
            isFlagged: recipe.flags?.some((f) => f.active) ? 1 : 0,
            timesRated: recipe.timesRated ?? 0,
            time: recipe.time ?? null,
            portionSize: recipe.portionSize ?? null,
            authorId: recipe.authorId,
            imageUrl: recipe.imageUrl
        };
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         UPSERT                                          $//
    //~-----------------------------------------------------------------------------------------~//

    async upsert(recipe: RecipeDTO): Promise<void> {
        try {
            // Do not ever remove this.
            await this.ensureCollectionExists();

            await this.client
                .collections(COLLECTION_NAME)
                .documents()
                .upsert(this.mapRecipeToDocument(recipe));

            log.trace('Recipe indexed/updated in Typesense', {
                id: recipe.id
            });
        } catch (error: unknown) {
            log.error('Failed to upsert recipe document in Typesense', error, {
                id: recipe.id
            });
            // This should not break the app, so we just log and continue.
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                       REINDEX ONE                                       $//
    //~-----------------------------------------------------------------------------------------~//

    async reindexOne(recipe: RecipeDTO): Promise<void> {
        log.trace('Reindexing single recipe in Typesense', {
            id: recipe.id,
            displayId: recipe.displayId
        });

        try {
            await this.client
                .collections(COLLECTION_NAME)
                .documents(recipe.id.toString())
                .update(this.mapRecipeToDocument(recipe));

            log.trace('Recipe reindexed successfully in Typesense', {
                id: recipe.id,
                displayId: recipe.displayId
            });
        } catch (error: unknown) {
            log.error('Failed to reindex recipe in Typesense', error, {
                id: recipe.id,
                displayId: recipe.displayId
            });
            throw new InfrastructureError(
                InfrastructureErrorCode.TYPESENSE_INDEX_UPDATE_FAILED
            );
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    SINGLE QUERY SEARCH                                  $//
    //~-----------------------------------------------------------------------------------------~//

    async searchSingleQuery(
        query: string,
        language: Locale,
        limit: number,
        offset: number
    ): Promise<RecipeForDisplayDTO[]> {
        const cacheKey = this.generateSearchCacheKey(
            query,
            language,
            limit,
            offset
        );

        return await this.cacheSearchQuery(cacheKey, async () => {
            try {
                await this.ensureCollectionExists();

                const page = Math.floor(offset / limit) + 1;

                const searchResult = await this.client
                    .collections(COLLECTION_NAME)
                    .documents()
                    .search({
                        q: query,
                        query_by: 'title,notes,ingredients,instructions',
                        sort_by: 'rating:desc,timesRated:desc',
                        filter_by: `language:=${language}`,
                        per_page: limit,
                        page,
                        operator: 'and'
                    });

                const hits: RecipeForDisplayDTO[] = (searchResult.hits || [])
                    .filter((hit: any) => !hit.document.isFlagged)
                    .map((hit: any) => {
                        const doc = hit.document as RecipeDocument;
                        return {
                            id: doc.id,
                            displayId: doc.displayId,
                            title: doc.title,
                            imageUrl: doc.imageUrl ?? '',
                            rating: doc.rating ?? null,
                            timesRated: doc.timesRated ?? 0,
                            time: doc.time ?? null,
                            portionSize: doc.portionSize ?? null
                        };
                    });

                return hits;
            } catch (error: unknown) {
                log.error('Typesense search failed', error, {
                    query
                });
                throw new InfrastructureError(
                    InfrastructureErrorCode.TYPESENSE_SEARCH_FAILED
                );
            }
        });
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    DELETE ONE DOCUMENT                                  $//
    //~-----------------------------------------------------------------------------------------~//

    async deleteOne(recipeId: number): Promise<void> {
        log.trace('Deleting recipe document in Typesense', {
            id: recipeId
        });

        try {
            await this.client
                .collections(COLLECTION_NAME)
                .documents(recipeId.toString())
                .delete();
        } catch (error: unknown) {
            log.error('Failed to delete recipe document in Typesense', error, {
                id: recipeId
            });
            throw new InfrastructureError(
                InfrastructureErrorCode.TYPESENSE_INDEX_UPDATE_FAILED
            );
        }

        log.trace('Recipe document deleted successfully in Typesense', {
            id: recipeId
        });
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    DELETE ALL DOCUMENTS                                 $//
    //~-----------------------------------------------------------------------------------------~//

    async deleteAllDocuments(): Promise<void> {
        log.info('Deleting all documents in Typesense collection', {
            collectionName: COLLECTION_NAME
        });

        try {
            await this.client.collections(COLLECTION_NAME).delete();

            log.info(
                'All documents deleted successfully in Typesense collection',
                {
                    collectionName: COLLECTION_NAME
                }
            );
        } catch (error: unknown) {
            log.error(
                'Failed to delete all documents in Typesense collection',
                error,
                {
                    collectionName: COLLECTION_NAME
                }
            );
        }
    }
}

const recipeSearchIndex = RecipeSearchIndex.getInstance();
export { recipeSearchIndex, RecipeSearchIndex };
