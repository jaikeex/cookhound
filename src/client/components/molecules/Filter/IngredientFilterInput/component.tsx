import { ComboInput, ChipButton } from '@/client/components';
import type { IngredientDTO } from '@/common/types';
import React from 'react';

export type IngredientFilterInputProps = Readonly<{
    id: string;
    name: string;
    options: { value: string; label: string }[];
    placeholder: string;
    selectedIngredients: IngredientDTO[];
    chipColor: 'secondary' | 'danger';
    onSelect: (option: { value: string; label: string }) => void;
    onRemove: (id: number) => () => void;
}>;

export const IngredientFilterInput: React.FC<IngredientFilterInputProps> = ({
    id,
    name,
    options,
    placeholder,
    selectedIngredients,
    chipColor,
    onSelect,
    onRemove
}) => (
    <div className="flex flex-col gap-2">
        <ComboInput
            id={id}
            name={name}
            options={options}
            placeholder={placeholder}
            onSelect={onSelect}
            resetValueOnSelect
        />

        {selectedIngredients.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 mt-1">
                {selectedIngredients.map((ing) => (
                    <ChipButton
                        key={ing.id}
                        size="sm"
                        color={chipColor}
                        icon="close"
                        onClick={onRemove(ing.id)}
                    >
                        {ing.name}
                    </ChipButton>
                ))}
            </div>
        ) : null}
    </div>
);
