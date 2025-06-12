import React from 'react';
import { RecipeCreate } from '@/client/components';
import { verifySession } from '@/server/utils';

export default async function Page() {
    await verifySession();

    return <RecipeCreate />;
}
