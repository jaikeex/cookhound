import React from 'react';
import { apiClient } from '@/client/request';
import { RecipeViewTemplate } from '@/client/components';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/common/constants/general';

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
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const recipe = apiClient.recipe.getRecipeByDisplayId(recipeDisplayId, {
        revalidate: 3600,
        ...(sessionId
            ? {
                  headers: { 'Cookie': `session=${sessionId}` }
              }
            : {})
    });

    return <RecipeViewTemplate recipe={recipe} />;
}
