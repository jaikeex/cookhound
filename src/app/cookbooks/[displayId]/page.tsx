import React from 'react';
import { apiClient } from '@/client/request';
import { CookbookVisibility } from '@/common/types';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/app/actions';
import { CookbookTemplate } from '@/client/components';

type CookbookPageParams = {
    readonly params: Promise<
        Readonly<{
            displayId: string;
        }>
    >;
};

export default async function Page({ params }: CookbookPageParams) {
    const paramsResolved = await params;
    const cookbookDisplayId = paramsResolved.displayId;

    const [user, cookbook] = await Promise.all([
        getCurrentUser(),
        apiClient.cookbook.getCookbookByDisplayId(cookbookDisplayId, {
            revalidate: 3600
        })
    ]);

    const isOwner = cookbook?.ownerId === user?.id;
    const isPublic = cookbook?.visibility === CookbookVisibility.PUBLIC;

    const isVisible = isOwner || isPublic;

    if (!isVisible) {
        notFound();
    }

    return <CookbookTemplate cookbook={cookbook} />;
}
