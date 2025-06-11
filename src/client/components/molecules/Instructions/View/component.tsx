import React from 'react';
import type { TypographyVariant } from '@/client/components';
import { Typography } from '@/client/components';
import type { Recipe } from '@/common/types';
import type { ViewPortVariant } from '@/client/types';

// ---------------------------------- config ----------------------------------
//                                    region

const classConfig = {
    typography: {
        'desktop': 'body-sm',
        'mobile': 'body'
    },

    spacing: {
        'desktop': 'space-y-2',
        'mobile': 'space-y-3'
    }
};

//                                  endregion
// ----------------------------------------------------------------------------

type InstructionsViewProps = Readonly<{
    className?: string;
    recipe: Recipe;
    variant: ViewPortVariant;
}>;

export const InstructionsView: React.FC<InstructionsViewProps> = ({
    className,
    recipe,
    variant
}) => {
    const typographyVariant = classConfig.typography[
        variant
    ] as TypographyVariant;

    return (
        <div className={`${classConfig.spacing[variant]} ${className}`}>
            {recipe.instructions.map((instruction, index) => (
                <Typography key={index} variant={typographyVariant}>
                    {instruction}
                </Typography>
            ))}
        </div>
    );
};
