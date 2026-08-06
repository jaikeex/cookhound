import React from 'react';
import { StructuredData } from '@/client/components/atoms/StructuredData/Generic';
import type { Recipe } from '@/common/types';
import {
    buildRecipeCrumbs,
    generateBreadcrumbSchema,
    generateRecipeSchema
} from '@/common/utils/seo';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

type RecipeStructuredDataProps = Readonly<{
    recipe: Recipe;
    authorName?: string;
}>;

export const RecipeStructuredData: React.FC<RecipeStructuredDataProps> = ({
    recipe,
    authorName
}) => {
    const recipeSchema = generateRecipeSchema(
        recipe,
        ENV_CONFIG_PUBLIC.ORIGIN,
        authorName
    );

    const breadcrumbSchema = generateBreadcrumbSchema(
        buildRecipeCrumbs(recipe, ENV_CONFIG_PUBLIC.ORIGIN)
    );

    return (
        <React.Fragment>
            <StructuredData schema={recipeSchema} id="recipe-jsonld" />
            <StructuredData schema={breadcrumbSchema} id="breadcrumb-jsonld" />
        </React.Fragment>
    );
};
