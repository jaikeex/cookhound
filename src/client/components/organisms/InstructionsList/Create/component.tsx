'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ButtonBase, DraggableList } from '@/client/components';
import { InstructionRowCreate } from '@/client/components/molecules/InstructionRow';
import { useLocale } from '@/client/store';
import { useScreenSize } from '@/client/hooks';

type InstructionsListCreateProps = Readonly<{
    onChange?: (value: string[]) => void;
}>;

export const InstructionsListCreate: React.FC<InstructionsListCreateProps> = ({
    onChange
}) => {
    const { t } = useLocale();
    const { isDesktop } = useScreenSize();

    // used only for the draggable list - should not be used to determine the order of instructions
    const [instructions, setInstructions] = useState<number[]>([0]);

    // used to store the actual instruction values in the correct order
    const [instructionValues, setInstructionValues] = useState<string[]>([]);

    const handleAddInstruction = useCallback(() => {
        setInstructions((prev) => {
            // Find the smallest missing index in the array, starting from 0
            const newInstruction = prev.length > 0 ? Math.max(...prev) + 1 : 0;
            return [...prev, newInstruction];
        });

        setInstructionValues((prev) => [...prev, '']);

        /**
         * The autofocus on mobile is quite annoying, so it is disabled there for now.
         */
        if (!isDesktop) return;

        // Focus the new instruction
        setTimeout(() => {
            const instruction = document.getElementById(
                'instruction-' + instructions.length
            );
            instruction?.focus();
        }, 0);
    }, [instructions.length, isDesktop]);

    const handleRemoveInstruction = useCallback(
        (key: number) => (index: number) => {
            setInstructions((prev) => prev.filter((i) => i !== key));
            setInstructionValues((prev) =>
                prev.filter((i, idx) => idx !== index)
            );
        },
        []
    );

    const handleRowChange = useCallback(
        (index: number) => (instruction: string) => {
            setInstructionValues((prev) => {
                const newInstructions = [...prev];
                newInstructions[index] = instruction;
                return newInstructions;
            });
        },
        []
    );

    useEffect(() => {
        onChange && onChange(instructionValues);
    }, [instructionValues, onChange]);

    return (
        <React.Fragment>
            <DraggableList onReorder={setInstructions} values={instructions}>
                {instructions.map((key, index) => (
                    <InstructionRowCreate
                        dragIndex={key}
                        key={key}
                        index={index}
                        onAddInstruction={handleAddInstruction}
                        onRemove={handleRemoveInstruction(key)}
                        onChange={handleRowChange(index)}
                    />
                ))}
            </DraggableList>
            <ButtonBase
                className={'w-full'}
                icon={'plus'}
                color={'subtle'}
                size={'sm'}
                onClick={handleAddInstruction}
            >
                {t('app.recipe.add-instruction')}
            </ButtonBase>
        </React.Fragment>
    );
};
