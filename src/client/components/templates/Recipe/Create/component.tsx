'use client';

import React from 'react';
import { MobileRecipeCreate } from './Mobile';
import { DesktopRecipeCreate } from './Desktop';

type RecipeCreateProps = Readonly<NonNullable<unknown>>;

export const RecipeCreate: React.FC<RecipeCreateProps> = () => {
    return (
        <React.Fragment>
            <MobileRecipeCreate className={'md:hidden'} />
            <DesktopRecipeCreate className={'hidden md:grid'} />
        </React.Fragment>
    );
};
