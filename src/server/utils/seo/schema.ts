import type { RecipeDTO, UserDTO, CookbookDTO } from '@/common/types';
import { CATEGORY_IDS } from '@/common/constants';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                     RICH RESULTS SCHEMA                                     ?//
///
//# Schemas tells search engines what exactly the content is about.
//# In short, the schema generation turns the domain object (Recipe, Cookbook, User, etc.) into
//# a standards-compliant json-ld so every page advertises its meaning to the crawlers.
//# That makes the page eligible for all of google's recipe related rich features.
//#
//# For more info in case i forget (which will probably be tomorrow) here are some links:
//# https://schema.org
//# https://schema.org/Recipe
//# https://developers.google.com/search/docs/appearance/structured-data/recipe
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export function generateRecipeSchema(recipe: RecipeDTO, baseUrl?: string) {
    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Recipe',
        name: recipe.title,
        image: recipe.imageUrl ? [recipe.imageUrl] : []
    };

    if (recipe.createdAt) {
        schema.publishedTime = recipe.createdAt;
    }

    if (recipe.updatedAt) {
        schema.modifiedTime = recipe.updatedAt;
    }

    // Map tags to cuisine/category
    if (recipe.tags) {
        const cuisineTags = recipe.tags.filter(
            (t) => t.categoryId === CATEGORY_IDS.cuisine
        );
        if (cuisineTags.length > 0) {
            schema.recipeCuisine = cuisineTags.map((t) => t.name).join(', ');
        }

        const typeTags = recipe.tags.filter(
            (t) => t.categoryId === CATEGORY_IDS.type
        );
        if (typeTags.length > 0) {
            schema.recipeCategory = typeTags.map((t) => t.name).join(', ');
        }
    }

    if (recipe.authorId && baseUrl) {
        schema.author = {
            '@type': 'Person',
            url: `${baseUrl}/user/${recipe.authorId}`
        };
    }

    if (recipe.instructions && recipe.instructions.length > 0) {
        const firstInstruction = recipe.instructions[0];
        if (firstInstruction) {
            // Use first instruction as a brief description
            schema.description =
                firstInstruction.length > 160
                    ? firstInstruction.substring(0, 157) + '...'
                    : firstInstruction;
        }
    }

    if (recipe.time) {
        schema.totalTime = `PT${recipe.time}M`;
    }

    if (recipe.portionSize) {
        schema.recipeYield = `${recipe.portionSize} servings`;
    }

    if (recipe.ingredients && recipe.ingredients.length > 0) {
        schema.recipeIngredient = recipe.ingredients.map((i) => {
            const amount = i.quantity ? `${i.quantity} ` : '';
            return `${amount}${i.name}`.trim();
        });
    }

    if (recipe.instructions && recipe.instructions.length > 0) {
        schema.recipeInstructions = recipe.instructions.map((step, idx) => ({
            '@type': 'HowToStep',
            position: idx + 1,
            text: step || ''
        }));
    }

    if (recipe.rating && recipe.rating > 0 && recipe.timesRated) {
        schema.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: recipe.rating,
            ratingCount: recipe.timesRated,
            bestRating: 5,
            worstRating: 1
        };
    }

    if (recipe.tags && recipe.tags.length > 0) {
        schema.keywords = recipe.tags.map((t) => t.name).join(', ');
    }

    return schema;
}

export function generatePersonSchema(user: UserDTO, baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: user.username,
        image: user.avatarUrl || `${baseUrl}/img/anonymous.webp`,
        url: `${baseUrl}/user/${user.id}`
    };
}

export function generateBreadcrumbSchema(
    items: Array<{ name: string; url: string }>
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            item: item.url
        }))
    };
}

export function generateWebSiteSchema(baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Cookhound',
        url: baseUrl,
        description: 'Cookhound is a platform for sharing recipes',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${baseUrl}/search?query={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    };
}

export function generateOrganizationSchema(baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Cookhound',
        url: baseUrl,
        logo: `${baseUrl}/img/logo-light.png`
    };
}

export function generateItemListSchema(
    items: Array<{ name: string; url: string; image?: string }>,
    listName: string
) {
    return {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: listName,
        itemListElement: items.map((item, idx) => ({
            '@type': 'ListItem',
            position: idx + 1,
            name: item.name,
            url: item.url,
            image: item.image
        }))
    };
}

export function generateCookbookSchema(cookbook: CookbookDTO, baseUrl: string) {
    return {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: cookbook.title,
        description: cookbook.description || `View ${cookbook.title} cookbook`,
        image: cookbook.coverImageUrl,
        url: `${baseUrl}/cookbooks/${cookbook.displayId}`,
        dateCreated: cookbook.createdAt,
        dateModified: cookbook.updatedAt || cookbook.createdAt
    };
}

export function serializeSchema(schema: Record<string, unknown>): string {
    return JSON.stringify(schema)
        .replace(/</g, '\\u003c')
        .replace(/>/g, '\\u003e')
        .replace(/&/g, '\\u0026');
}
