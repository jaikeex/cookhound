import React from 'react';
import apiClient from '@/client/request';
import { RecipeViewTemplate } from '@/client/components';
import { cookies } from 'next/headers';
import { JWT_COOKIE_NAME } from '@/common/constants';

type RecipePageParams = {
    readonly params: Promise<
        Readonly<{
            displayId: string;
        }>
    >;
};

export default async function Page({ params }: RecipePageParams) {
    const paramsResolved = await params;
    const recipeDisplayId = paramsResolved.displayId;

    const cookieStore = await cookies();
    const token = cookieStore.get(JWT_COOKIE_NAME);

    const recipe = apiClient.recipe.getRecipeByDisplayId(recipeDisplayId, {
        revalidate: 3600,
        ...(token && {
            headers: {
                Cookie: `${JWT_COOKIE_NAME}=${token.value}`
            }
        })
    });

    return <RecipeViewTemplate recipe={recipe} />;
}
