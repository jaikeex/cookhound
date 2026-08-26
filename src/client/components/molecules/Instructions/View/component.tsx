'use client';

import React, { useCallback } from 'react';
import { InstructionRowView } from '@/client/components/molecules/InstructionRow/View';
import { useRecipeSelectionStore } from '@/client/store/app-store/useRecipeSelectionStore';
import { classNames } from '@/client/utils';
import type { Recipe } from '@/common/types';

const SPACING = 'space-y-3 @recipe:space-y-4';
const EMPTY_CHECKED: readonly number[] = Object.freeze([]);

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type InstructionsViewProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    recipe: Recipe;
}>;

export const InstructionsView: React.FC<InstructionsViewProps> = ({
    className,
    isPreview = false,
    recipe
}) => {
    const toggleInstruction = useRecipeSelectionStore(
        (state) => state.toggleInstruction
    );

    // Scoped to the active recipe so a stale selection from an earlier page
    // cannot light up steps belonging to a different recipe. The preview is
    // excluded outright rather than scoped: it renders a recipe being edited
    // rather than cooked, and its id can equal the active one, so the scoping
    // check alone would let the detail page's ticks bleed into it.
    const checkedIndexes = useRecipeSelectionStore((state) =>
        !isPreview && state.activeRecipeId === recipe.id
            ? state.checkedInstructionIndexes
            : EMPTY_CHECKED
    );

    const handleToggle = useCallback(
        (index: number) => toggleInstruction(recipe.id, index),
        [recipe.id, toggleInstruction]
    );

    return (
        <ol className={classNames(SPACING, 'list-none', className)}>
            {recipe.instructions.map((instruction, index) => (
                <li key={index}>
                    <InstructionRowView
                        checked={checkedIndexes.includes(index)}
                        disabled={isPreview}
                        index={index}
                        instruction={instruction}
                        onToggle={handleToggle}
                    />
                </li>
            ))}
        </ol>
    );
};
