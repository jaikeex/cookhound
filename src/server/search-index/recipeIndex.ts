import { typesenseClient } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type { RecipeDTO, RecipeForDisplayDTO } from '@/common/types';
import type { Locale } from '@/client/locales';
import { redisClient } from '@/server/integrations';

const log = Logger.getInstance('recipe-index');

const COLLECTION_NAME = 'recipes';

interface RecipeDocument {
    id: string;
    displayId: string;
    language: Locale;
    title: string;
    notes: string | null;
    ingredients: string[];
    instructions: string[];
    rating: number | null;
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
        ttlInSeconds: number = 3600
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
        } catch (error) {
            log.error('Cache operation failed for search query', {
                cacheKey,
                error
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
        } catch (err: any) {
            /**
             * This explicit check is needed to detect when the collection is not present in typesense.
             */
            const isNotFound =
                err?.httpStatus === 404 ||
                err?.name === 'ObjectNotFound' ||
                err?.code === 404;

            if (!isNotFound) {
                log.error('Failed to retrieve Typesense collection', { err });
                throw err;
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
                    { name: 'time', type: 'int32', optional: true },
                    { name: 'portionSize', type: 'int32', optional: true },
                    { name: 'authorId', type: 'int32' },
                    { name: 'imageUrl', type: 'string', optional: true }
                ]
            });

            this.collectionReady = true;

            log.info('Typesense recipe collection created successfully');
        } catch (err) {
            /**
             * Throw the error here.
             * There is no reasonable reason for this to ever happen, and the collection will be
             * present already anyway, so failure here is some shitty magic that needs to be seen.
             */
            log.error('Failed to create Typesense collection', { err });
            throw err;
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
        } catch (err: any) {
            log.error('Failed to upsert recipe document in Typesense', {
                id: recipe.id,
                stack: err.stack
            });
            throw err;
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

                const hits: RecipeForDisplayDTO[] = (
                    searchResult.hits || []
                ).map((hit: any) => {
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
            } catch (err) {
                log.error('Typesense search failed', { err, query });
                throw err;
            }
        });
    }
}

const recipeSearchIndex = RecipeSearchIndex.getInstance();
export { recipeSearchIndex, RecipeSearchIndex };
