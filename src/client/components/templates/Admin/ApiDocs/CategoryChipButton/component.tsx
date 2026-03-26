import React, { useCallback } from 'react';
import { ChipButton } from '@/client/components';

export type CategoryChipButtonProps = Readonly<{
    category: string;
    isActive: boolean;
    onClick: (category: string) => void;
}>;

export const CategoryChipButton: React.FC<CategoryChipButtonProps> = ({
    category,
    isActive,
    onClick
}) => {
    const handleClick = useCallback(() => {
        onClick(category);
    }, [onClick, category]);

    return (
        <ChipButton
            color={isActive ? 'primary' : 'subtle'}
            outlined={!isActive}
            size="sm"
            onClick={handleClick}
        >
            {category}
        </ChipButton>
    );
};
