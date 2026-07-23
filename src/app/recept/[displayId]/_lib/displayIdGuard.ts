import { notFound } from 'next/navigation';
import {
    LEGACY_DISPLAY_ID_REGEX,
    RECIPE_DISPLAY_ID_REGEX
} from '@/common/constants';
import { serverData } from '@/server/data';

//?—————————————————————————————————————————————————————————————————————————————————————————?//
//?                                  LEGACY RECIPE PATHS                                    ?//
///
//# The recipe urls and display ids evolved a lot since the first version.
//# First, there were uuids, then, there was the language switch and now, there is
//# a numeric display id and a different route altogether.
//# To keep recipes that are already indexed still servable (is that a word?)
//# this code exists.
//#
//# Three possible outcomes here:
//#   (1) - A legacy uuid display id resolves to its canonical target (404 when unknown)
//#         and the caller decides what to do.
//#   (2) - Anything that is not a current display id 404s without touching the db.
//#   (3) - A current display id passes through with null.
///
//?—————————————————————————————————————————————————————————————————————————————————————————?//

export type LegacyRecipeTarget = Readonly<{
    displayId: string;
    title: string;
}>;

export async function guardRecipeDisplayId(
    recipeDisplayId: string
): Promise<LegacyRecipeTarget | null> {
    if (LEGACY_DISPLAY_ID_REGEX.test(recipeDisplayId)) {
        const target = await serverData.recipe.getByLegacyDisplayId(
            recipeDisplayId.toLowerCase()
        );

        if (!target) {
            notFound();
        }

        return target;
    }

    if (!RECIPE_DISPLAY_ID_REGEX.test(recipeDisplayId)) {
        notFound();
    }

    return null;
}
