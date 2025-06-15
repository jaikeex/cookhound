'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BaseTextarea, DraggableInputRow } from '@/client/components';

type InstructionRowCreateProps = Readonly<{
    className?: string;
    dragIndex: number;
    index: number;
    onAddInstruction?: () => void;
    onChange?: (instruction: string) => void;
    onRemove?: (index: number) => void;
}>;

export const InstructionRowCreate: React.FC<InstructionRowCreateProps> = ({
    className,
    dragIndex,
    index,
    onAddInstruction,
    onChange,
    onRemove
}) => {
    const [instruction, setInstruction] = useState<string>('');

    const handleRemove = useCallback(() => {
        onRemove && onRemove(index);
    }, [index, onRemove]);

    const handleKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                onAddInstruction && onAddInstruction();
            }
        },
        [onAddInstruction]
    );

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setInstruction(e.target.value);
            onChange && onChange(e.target.value);
        },
        [onChange]
    );

    useEffect(() => {
        onChange && onChange(instruction);
        // This is intentional, only run this effect when the index changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

    return (
        <DraggableInputRow
            index={dragIndex}
            className={className}
            onRemove={handleRemove}
        >
            <BaseTextarea
                id={`instruction-${index}`}
                name={`instruction-${index}`}
                placeholder={index === 0 ? 'Předehřej troubu na 180°C' : ''}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
            />
        </DraggableInputRow>
    );
};
