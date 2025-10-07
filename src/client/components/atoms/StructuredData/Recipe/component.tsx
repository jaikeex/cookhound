import React from 'react';
import { StructuredData } from '@/client/components';
import type { RecipeDTO } from '@/common/types';
import {
    generateBreadcrumbSchema,
    generateRecipeSchema
} from '@/server/utils/seo';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { tServer } from '@/server/utils/locales';

type RecipeStructuredDataProps = Readonly<{
    recipePromise: Promise<RecipeDTO>;
}>;

export const RecipeStructuredData: React.FC<
    RecipeStructuredDataProps
> = async ({ recipePromise }) => {
    const recipe = await recipePromise;
    const recipeSchema = generateRecipeSchema(recipe, ENV_CONFIG_PUBLIC.ORIGIN);

    // Generate breadcrumb schema: Home > Recipe
    const breadcrumbSchema = generateBreadcrumbSchema([
        {
            name: tServer(recipe.language, 'app.general.home'),
            url: ENV_CONFIG_PUBLIC.ORIGIN
        },
        {
            name: recipe.title,
            url: `${ENV_CONFIG_PUBLIC.ORIGIN}/recipe/${recipe.displayId}`
        }
    ]);

    return (
        <React.Fragment>
            <StructuredData schema={recipeSchema} id="recipe-jsonld" />
            <StructuredData schema={breadcrumbSchema} id="breadcrumb-jsonld" />
        </React.Fragment>
    );
};
