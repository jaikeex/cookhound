import { z } from 'zod';

/**
 * Shared Zod response schemas for API documentation.
 * Each schema mirrors a DTO.
 */

//|=============================================================================================|//
//?                                        BUILDING BLOCKS                                      ?//
//|=============================================================================================|//

const IngredientResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    quantity: z.string().nullable(),
    category: z.string().nullable().optional(),
    categoryOrder: z.number().nullable().optional()
});

const RecipeTagResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    categoryId: z.number()
});

const RecipeFlagResponseSchema = z.object({
    id: z.number(),
    reason: z.string(),
    userId: z.number(),
    resolved: z.boolean(),
    active: z.boolean(),
    createdAt: z.string(),
    resolvedAt: z.string().nullable()
});

const CookieConsentResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    consent: z.boolean(),
    version: z.string(),
    userIpAddress: z.string(),
    userAgent: z.string(),
    createdAt: z.string(),
    revokedAt: z.string().nullable(),
    updatedAt: z.string(),
    proofHash: z.string(),
    accepted: z.array(
        z.enum(['essential', 'preferences', 'analytics', 'marketing'])
    )
});

const TermsAcceptanceResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    version: z.string(),
    userIpAddress: z.string(),
    userAgent: z.string(),
    createdAt: z.string(),
    revokedAt: z.string().nullable(),
    updatedAt: z.string(),
    proofHash: z.string()
});

//|=============================================================================================|//
//?                                        USER SCHEMAS                                         ?//
//|=============================================================================================|//

export const UserResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    avatarUrl: z.string().nullable(),
    email: z.string().nullable(),
    cookieConsent: z.array(CookieConsentResponseSchema).nullable(),
    termsAcceptance: z.array(TermsAcceptanceResponseSchema).nullable(),
    preferences: z.record(z.string(), z.any()),
    role: z.enum(['guest', 'user', 'admin']),
    status: z.enum(['active', 'pending_deletion', 'banned']),
    authType: z.enum(['local', 'google']),
    createdAt: z.string(),
    lastLogin: z.string().nullable(),
    lastVisitedAt: z.string().nullable(),
    deletedAt: z.string().nullable(),
    deletionScheduledFor: z.string().nullable()
});

//|=============================================================================================|//
//?                                        RECIPE SCHEMAS                                       ?//
//|=============================================================================================|//

export const RecipeResponseSchema = z.object({
    id: z.number(),
    displayId: z.string(),
    title: z.string(),
    authorId: z.number(),
    language: z.enum(['en', 'cs']),
    time: z.number().nullable(),
    portionSize: z.number().nullable(),
    ingredients: z.array(IngredientResponseSchema),
    instructions: z.array(z.string()),
    notes: z.string().nullable(),
    imageUrl: z.string(),
    rating: z.number().nullable(),
    flags: z.array(RecipeFlagResponseSchema).nullable(),
    timesRated: z.number(),
    timesViewed: z.number(),
    tags: z.array(RecipeTagResponseSchema).nullable(),
    createdAt: z.string(),
    updatedAt: z.string()
});

export const RecipeDisplayResponseSchema = z.object({
    id: z.number(),
    displayId: z.string(),
    title: z.string(),
    imageUrl: z.string(),
    rating: z.number().nullable(),
    timesRated: z.number(),
    time: z.number().nullable(),
    portionSize: z.number().nullable()
});

export { RecipeTagResponseSchema };

export const TagListResponseSchema = z.object({
    category: z.string(),
    tags: z.array(RecipeTagResponseSchema)
});

//|=============================================================================================|//
//?                                       COOKBOOK SCHEMAS                                       ?//
//|=============================================================================================|//

export const CookbookResponseSchema = z.object({
    id: z.number(),
    displayId: z.string(),
    ownerId: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    language: z.enum(['en', 'cs']),
    visibility: z.enum(['PUBLIC', 'PRIVATE', 'UNLISTED']),
    coverImageUrl: z.string().nullable(),
    recipeCount: z.number(),
    recipes: z.array(RecipeDisplayResponseSchema),
    createdAt: z.string(),
    updatedAt: z.string()
});

//|=============================================================================================|//
//?                                        ADMIN SCHEMAS                                        ?//
//|=============================================================================================|//

export const AdminStatsResponseSchema = z.object({
    counts: z.object({
        totalUsers: z.number(),
        totalRecipes: z.number(),
        openFlags: z.number(),
        newUsersLast30Days: z.number(),
        newRecipesLast30Days: z.number(),
        totalRatings: z.number()
    }),
    recentRecipes: z.array(
        z.object({
            id: z.number(),
            displayId: z.string(),
            title: z.string(),
            authorUsername: z.string(),
            language: z.string(),
            createdAt: z.string()
        })
    ),
    recentUsers: z.array(
        z.object({
            id: z.number(),
            username: z.string(),
            email: z.string(),
            authType: z.string(),
            createdAt: z.string()
        })
    )
});

const AdminUserListItemSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    authType: z.string(),
    role: z.string(),
    status: z.string(),
    emailVerified: z.boolean(),
    avatarUrl: z.string().nullable(),
    createdAt: z.string(),
    lastLogin: z.string().nullable(),
    lastVisitedAt: z.string().nullable(),
    recipeCount: z.number()
});

export const AdminUserListResponseSchema = z.object({
    users: z.array(AdminUserListItemSchema),
    totalItems: z.number(),
    page: z.number(),
    pageSize: z.number()
});

export const AdminUserDetailResponseSchema = z.object({
    id: z.number(),
    username: z.string(),
    email: z.string(),
    authType: z.string(),
    role: z.string(),
    status: z.string(),
    emailVerified: z.boolean(),
    avatarUrl: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    lastLogin: z.string().nullable(),
    lastVisitedAt: z.string().nullable(),
    lastPasswordReset: z.string().nullable(),
    deletedAt: z.string().nullable(),
    deletionScheduledFor: z.string().nullable(),
    recipeCount: z.number(),
    ratingCount: z.number(),
    flagCount: z.number()
});

//|=============================================================================================|//
//?                                       SHOPPING LIST                                         ?//
//|=============================================================================================|//

export const ShoppingListResponseSchema = z.object({
    recipe: z.object({
        id: z.number(),
        displayId: z.string(),
        title: z.string(),
        portionSize: z.number().nullable()
    }),
    ingredients: z.array(
        z.object({
            recipeId: z.number(),
            name: z.string(),
            id: z.number(),
            quantity: z.string().nullable(),
            category: z.string().nullable().optional(),
            marked: z.boolean()
        })
    )
});
