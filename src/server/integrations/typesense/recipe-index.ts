import { TypesenseClient } from './client';
import { Logger } from '@/server/logger';
import type { RecipeDTO, RecipeForDisplayDTO } from '@/common/types';
import type { Locale } from '@/client/locales';

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
        this.client = TypesenseClient.getInstance().getClient();
    }

    static getInstance(): RecipeSearchIndex {
        if (!RecipeSearchIndex.instance) {
            RecipeSearchIndex.instance = new RecipeSearchIndex();
        }
        return RecipeSearchIndex.instance;
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
            // Check for collection not found - Typesense can return different error formats
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
    //$                                         SEARCH                                          $//
    //~-----------------------------------------------------------------------------------------~//

    async search(
        query: string,
        language: Locale,
        limit: number,
        offset: number
    ): Promise<RecipeForDisplayDTO[]> {
        await this.ensureCollectionExists();
        const page = Math.floor(offset / limit) + 1;

        try {
            const searchResult = await this.client
                .collections(COLLECTION_NAME)
                .documents()
                .search({
                    q: query,
                    query_by: 'title,notes,ingredients,instructions',
                    filter_by: `language:=${language}`,
                    per_page: limit,
                    page
                });

            const hits: RecipeForDisplayDTO[] = (searchResult.hits || []).map(
                (hit: any) => {
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
                }
            );

            return hits;
        } catch (err) {
            log.error('Typesense search failed', { err, query });
            throw err;
        }
    }
}

const recipeSearchIndex = RecipeSearchIndex.getInstance();

export { recipeSearchIndex, RecipeSearchIndex };
