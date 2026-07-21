import React from 'react';
import { RecipeCreateTemplate } from '@/client/components';
import type { Metadata } from 'next';

//|=============================================================================================|//

export default async function RecipeCreatePage() {
    return <RecipeCreateTemplate />;
}

//|=============================================================================================|//

export const metadata: Metadata = {
    title: 'Create Recipe | Cookhound',
    description: 'Share your favorite recipe with the Cookhound community.',
    robots: {
        index: false,
        follow: false
    }
};
