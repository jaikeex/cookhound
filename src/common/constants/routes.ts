import { slugifyRecipeTitle } from '@/common/utils/titleSlug';

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                    USER-FACING ROUTE PATHS                                  ?//
///
//# Single source of truth for the shape of user-facing urls that are built in code (links,
//# canonical urls, structured data). A future slug rename then only touches this file
//# plus a redirect entry, instead of a grep across the codebase.
//#
//# The SEGMENTS map is the only place a url segment is spelled out - every path and builder
//# derives from it (values and branded types alike), so renaming a segment is a one-line change
//# here (plus the corresponding directory rename under src/app and a redirects() entry).
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

const SEGMENTS = {
    recipe: '/recept',
    cookbook: '/kucharky',
    user: '/profil',
    auth: '/auth',
    admin: '/admin',
    error: '/error'
} as const;

//~—————————————————————————————————————————————————————————————————————————————————————————————~//
//$                                         PATH TYPES                                          $//
///
//# Template literal return types for the dynamic builders. A value typed `RecipePath` is a
//# string subtype (so it still interpolates and passes to href/redirect/router.push freely),
//# but an arbitrary string like '/dement' is not assignable to it; use these to constrain any
//# consumer that must receive a specific kind of url. The prefixes derive from SEGMENTS, so a
//# segment rename updates both the values and the types in lockstep.
///
//~—————————————————————————————————————————————————————————————————————————————————————————————~//

/** A recipe detail path, e.g. `/recept/abc123`. */
export type RecipePath = `${typeof SEGMENTS.recipe}/${string}`;

/** A recipe edit path, e.g. `/recept/abc123/edit`. */
export type RecipeEditPath = `${RecipePath}/edit`;

/** A cookbook detail path, e.g. `/kucharky/abc123`. */
export type CookbookPath = `${typeof SEGMENTS.cookbook}/${string}`;

/** A user profile path, e.g. `/profil/42`. */
export type UserPath = `${typeof SEGMENTS.user}/${string | number}`;

/** The search path, bare or with an (already url-encoded) query. */
export type SearchPath = '/vyhledavani' | `/vyhledavani?query=${string}`;

//~—————————————————————————————————————————————————————————————————————————————————————————————~//
//$                                       ROUTE REGISTRY                                        $//
//~—————————————————————————————————————————————————————————————————————————————————————————————~//

export const ROUTES = {
    //|-----------------------------------------------------------------------------------------|//
    //?                                    PUBLIC (INDEXABLE)                                   ?//
    //|-----------------------------------------------------------------------------------------|//

    home: '/',
    filter: '/filtr',
    terms: '/podminky',
    privacy: '/soukromi',
    contact: '/kontakt',

    /**
     * Builds the path for the search page, optionally with a query.
     * The query is url-encoded here - pass it raw. Call with no argument
     * for the bare `/vyhledavani` path.
     *
     * @param query - The raw search query (already-joined multi-queries included).
     */
    search: (query?: string): SearchPath =>
        query
            ? `/vyhledavani?query=${encodeURIComponent(query)}`
            : '/vyhledavani',

    //|-----------------------------------------------------------------------------------------|//
    //?                                         RECIPE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    recipe: {
        create: `${SEGMENTS.recipe}/create`,

        /**
         * Builds the path for a recipe detail page.
         *
         * @param displayId - The recipe's public display id.
         * @param title - The recipe title.
         */
        detail: (displayId: string, title?: string): RecipePath => {
            const titleSlug = title ? slugifyRecipeTitle(title) : '';

            return titleSlug
                ? `${SEGMENTS.recipe}/${displayId}/${titleSlug}`
                : `${SEGMENTS.recipe}/${displayId}`;
        },

        /**
         * Builds the path for a recipe's edit page.
         *
         * @param displayId - The recipe's public display id.
         */
        edit: (displayId: string): RecipeEditPath =>
            `${SEGMENTS.recipe}/${displayId}/edit`
    },

    //|-----------------------------------------------------------------------------------------|//
    //?                                        COOKBOOK                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    cookbook: {
        /**
         * Builds the path for a cookbook detail page.
         *
         * @param displayId - The cookbook's public display id.
         */
        detail: (displayId: string): CookbookPath =>
            `${SEGMENTS.cookbook}/${displayId}`
    },

    //|-----------------------------------------------------------------------------------------|//
    //?                                   USER (AUTHENTICATED)                                  ?//
    //|-----------------------------------------------------------------------------------------|//

    user: {
        changeEmail: `${SEGMENTS.user}/change-email`,

        /**
         * Builds the path for a user profile page.
         *
         * @param id - The user's id.
         */
        detail: (id: number | string): UserPath => `${SEGMENTS.user}/${id}`
    },

    shoppingList: '/nakupni-seznam',

    //|-----------------------------------------------------------------------------------------|//
    //?                                          AUTH                                           ?//
    //|-----------------------------------------------------------------------------------------|//

    auth: {
        login: `${SEGMENTS.auth}/prihlaseni`,
        register: `${SEGMENTS.auth}/registrace`,
        resetPassword: `${SEGMENTS.auth}/reset-hesla`,
        verifyEmail: `${SEGMENTS.auth}/verify-email`,
        verifyEmailChange: `${SEGMENTS.auth}/verify-email-change`,

        callback: {
            /** Prefix of all oauth/email callback routes (robots disallow, etc.). */
            root: `${SEGMENTS.auth}/callback`,
            google: `${SEGMENTS.auth}/callback/google`,
            verifyEmail: `${SEGMENTS.auth}/callback/verify-email`,
            resetPassword: `${SEGMENTS.auth}/callback/reset-password`
        }
    },

    //|-----------------------------------------------------------------------------------------|//
    //?                                          ADMIN                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    admin: {
        root: SEGMENTS.admin,
        users: `${SEGMENTS.admin}/users`,
        reports: `${SEGMENTS.admin}/reports`,
        apiDocs: `${SEGMENTS.admin}/api-docs`
    },

    //|-----------------------------------------------------------------------------------------|//
    //?                                          ERROR                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    error: {
        /** Prefix of all error routes (robots disallow, etc.). */
        root: SEGMENTS.error,
        restricted: `${SEGMENTS.error}/restricted`,
        banned: `${SEGMENTS.error}/banned`,
        tooManyRequests: `${SEGMENTS.error}/too-many-requests`
    }
} as const;
