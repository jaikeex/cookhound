import { FrontPageTemplate } from '@/client/components/templates/FrontPage';
import { FrontPageSkeleton } from '@/client/components/templates/FrontPage/skeleton';
import apiClient from '@/client/request';
import React, { Suspense } from 'react';

export default function Home() {
    const recipesForDisplay = apiClient.recipe.getRecipeList(1, 24);

    return (
        <Suspense fallback={<FrontPageSkeleton />}>
            <FrontPageTemplate recipes={recipesForDisplay} />
        </Suspense>
    );
}
