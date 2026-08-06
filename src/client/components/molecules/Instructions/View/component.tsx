import React from 'react';
import { Typography } from '@/client/components/atoms/Typography';
import type { Recipe } from '@/common/types';

const SPACING = 'space-y-3 @recipe:space-y-4';

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type InstructionsViewProps = Readonly<{
    className?: string;
    recipe: Recipe;
}>;

export const InstructionsView: React.FC<InstructionsViewProps> = ({
    className,
    recipe
}) => {
    return (
        <div className={`${SPACING} ${className}`}>
            {recipe.instructions.map((instruction, index) => (
                <Typography key={index} variant="body">
                    {instruction}
                </Typography>
            ))}
        </div>
    );
};
