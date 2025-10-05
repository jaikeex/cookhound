import React from 'react';
import { Typography, type TypographyVariant } from '@/client/components';
import type { RecipeDTO } from '@/common/types';
import type { ViewPortVariant } from '@/client/types';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    typography: {
        'desktop': 'body-md',
        'mobile': 'body'
    },

    spacing: {
        'desktop': 'space-y-4',
        'mobile': 'space-y-3'
    }
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type InstructionsViewProps = Readonly<{
    className?: string;
    recipe: RecipeDTO;
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
