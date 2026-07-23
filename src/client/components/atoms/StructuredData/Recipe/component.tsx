import React from 'react';
import { StructuredData } from '@/client/components';
import type { Recipe } from '@/common/types';
import {
    generateBreadcrumbSchema,
    generateRecipeSchema,
    resolveRecipeHubCrumb
} from '@/server/utils/seo';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

type RecipeStructuredDataProps = Readonly<{
    recipePromise: Promise<Recipe>;
    authorNamePromise?: Promise<string | undefined>;
}>;

export const RecipeStructuredData: React.FC<
    RecipeStructuredDataProps
> = async ({ recipePromise, authorNamePromise }) => {
    const [recipe, authorName] = await Promise.all([
        recipePromise,
        authorNamePromise
    ]);

    const recipeSchema = generateRecipeSchema(
        recipe,
        ENV_CONFIG_PUBLIC.ORIGIN,
        authorName
    );

    const hubCrumb = resolveRecipeHubCrumb(recipe.tags);

    const breadcrumbSchema = generateBreadcrumbSchema([
        {
            name: t('app.general.home'),
            url: ENV_CONFIG_PUBLIC.ORIGIN
        },
        ...(hubCrumb
            ? [
                  {
                      name: hubCrumb.name,
                      url: `${ENV_CONFIG_PUBLIC.ORIGIN}${hubCrumb.path}`
                  }
              ]
            : []),
        {
            name: recipe.title,
            url: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.recipe.detail(recipe.displayId, recipe.title)}`
        }
    ]);

    return (
        <React.Fragment>
            <StructuredData schema={recipeSchema} id="recipe-jsonld" />
            <StructuredData schema={breadcrumbSchema} id="breadcrumb-jsonld" />
        </React.Fragment>
    );
};
