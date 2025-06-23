'use client';

import React from 'react';
import type { ShoppingListDTO } from '@/common/types';

type ShoppingListTemplateProps = Readonly<{
    initialData: ShoppingListDTO[];
}>;

export const ShoppingListTemplate: React.FC<ShoppingListTemplateProps> = () => {
    return <div>Shopping List</div>;
};
