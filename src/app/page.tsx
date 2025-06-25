import { FrontPageTemplate } from '@/client/components/templates/Dashboard/FrontPage';
import { FrontPageSkeleton } from '@/client/components/templates/Dashboard/FrontPage/skeleton';
import apiClient from '@/client/request';
import { JWT_COOKIE_NAME } from '@/common/constants';
import { cookies } from 'next/headers';
import React, { Suspense } from 'react';

export default async function Home() {
    const cookieStore = await cookies();

    const token = cookieStore.get(JWT_COOKIE_NAME)?.value;

    const recipesForDisplay = apiClient.recipe.getRecipeList(1, 24, {
        headers: { 'Cookie': `${JWT_COOKIE_NAME}=${token}` }
    });

    return (
        <Suspense fallback={<FrontPageSkeleton />}>
            <FrontPageTemplate initialRecipes={recipesForDisplay} />
        </Suspense>
    );
}
