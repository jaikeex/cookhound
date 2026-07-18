//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                    USER-FACING ROUTE PATHS                                  ?//
///
//# Single source of truth for the shape of user-facing urls that are built in code (links,
//# canonical urls, structured data). A future slug rename then only touches this file
//# plus a redirect entry, instead of a grep across the codebase.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export const FILTER_PATH = '/filter';

/**
 * Builds the path for a recipe detail page.
 *
 * @param displayId - The recipe's public display id.
 */
export const buildRecipePath = (displayId: string): string =>
    `/recipe/${displayId}`;
