'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BaseTextarea } from '@/client/components/atoms/Input/BaseTextarea';
import { DraggableInputRow } from '@/client/components/molecules/Form/DraggableInputRow';
import { useCreateRecipeStore } from '@/client/store';

type InstructionRowCreateProps = Readonly<{
    className?: string;
    defaultInstruction?: string | null;
    dragIndex: number;
    index: number;
    onAddInstruction?: () => void;
    onChange?: (instruction: string) => void;
    onRemove?: (index: number) => void;
}>;

export const InstructionRowCreate: React.FC<InstructionRowCreateProps> = ({
    className,
    defaultInstruction,
    dragIndex,
    index,
    onAddInstruction,
    onChange,
    onRemove
}) => {
    const [instruction, setInstruction] = useState<string>(
        defaultInstruction ?? ''
    );
    const instructionsCount = useCreateRecipeStore(
        (state) => state.recipeObject?.instructions?.length ?? 0
    );

    const disableHandling = index === 0 && instructionsCount === 1;

    const handleRemove = useCallback(() => {
        onRemove?.(index);
    }, [index, onRemove]);

    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                onAddInstruction?.();
            }
        },
        [onAddInstruction]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setInstruction(e.target.value);
            onChange?.(e.target.value);
        },
        [onChange]
    );

    useEffect(() => {
        if (instruction) {
            onChange?.(instruction);
        }
        // This is intentional, only run this effect when the index changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

    return (
        <DraggableInputRow
            index={dragIndex}
            className={className}
            onRemove={handleRemove}
            disableRemove={disableHandling}
            disableDrag={disableHandling}
        >
            <BaseTextarea
                defaultValue={defaultInstruction}
                id={`instruction-${index}`}
                name={`instruction-${index}`}
                placeholder={index === 0 ? 'Předehřej troubu na 180°C' : ''}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
            />
        </DraggableInputRow>
    );
};
