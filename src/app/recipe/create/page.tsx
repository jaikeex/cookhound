import React from 'react';
import { RecipeCreate } from '@/client/components';
import { verifySessionWithRedirect } from '@/server/utils';

export default async function Page() {
    await verifySessionWithRedirect();

    return <RecipeCreate />;
}
