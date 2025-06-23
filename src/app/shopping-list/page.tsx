import React from 'react';
import apiClient from '@/client/request';
import { cookies } from 'next/headers';
import { ShoppingListTemplate } from '@/client/components/templates/ShoppingList';

export default async function Page() {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt')?.value;

    const shoppingList = await apiClient.user.getShoppingList({
        headers: { 'Cookie': `jwt=${token}` }
    });

    return <ShoppingListTemplate initialData={shoppingList} />;
}
