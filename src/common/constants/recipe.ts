//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                 RECIPE URL PARAM CONSTANTS                                   ?//
///
//# Recipe detail urls follow the "Stack Overflow pattern" (yes, that is a thing):
//#
//#    /recept/<displayId>/<titleSlug>
//#
//# where the title slug is a function of the recipe title and carries no identity, lookups go
//# by displayId alone, and a missing or mismatched title slug pushes 308 to the canonical url.
//# There is deliberately NO slug column anywhere in the database.
//#
//# I suck at regex btw, so these are all generated.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

/** The current recipe display id: a fixed-length 6-digit number, first digit non-zero. */
export const RECIPE_DISPLAY_ID_REGEX = /^[1-9][0-9]{5}$/;

/** A well-formed recipe title slug: dash-separated lowercase alphanumeric words. */
export const RECIPE_TITLE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** The pre-refactor recipe display id: a v4 randomUUID(). */
export const LEGACY_DISPLAY_ID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Hard cap on generated title slug length, applied before the trailing-dash re-trim. */
export const RECIPE_TITLE_SLUG_MAX_LENGTH = 80;
