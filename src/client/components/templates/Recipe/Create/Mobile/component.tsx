'use client';

import React from 'react';

type MobileRecipeCreateProps = Readonly<{
    className?: string;
}>;

export const MobileRecipeCreate: React.FC<MobileRecipeCreateProps> = ({
    className
}) => {
    return <div className={className} />;
};
