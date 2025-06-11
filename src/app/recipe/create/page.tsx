import React from 'react';
import { RecipeCreate } from '@/client/components';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
    const cookieStore = await cookies();

    const authTokenCookie = cookieStore.get('jwt');

    if (!authTokenCookie) redirect('/auth/login');

    return <RecipeCreate />;
}
