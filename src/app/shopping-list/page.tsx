import React from 'react';
import { apiClient } from '@/client/request';
import { cookies } from 'next/headers';
import { ShoppingListTemplate } from '@/client/components/templates/ShoppingList';
import { JWT_COOKIE_NAME } from '@/common/constants';
import { verifyToken } from '@/server/utils/session';

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get(JWT_COOKIE_NAME)?.value;

    if (!token) {
        throw new Error('No token found');
    }

    const { id } = verifyToken(token);

    const shoppingList = await apiClient.user.getShoppingList(Number(id), {
        headers: { 'Cookie': `${JWT_COOKIE_NAME}=${token}` }
    });

    return <ShoppingListTemplate initialData={shoppingList} />;
}
