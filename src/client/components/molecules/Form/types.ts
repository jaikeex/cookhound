import type React from 'react';

export type FormInputProps = Readonly<{
    className?: string;
    defaultValue?: string;
    disabled?: boolean;
    error?: string;
    id: string;
    label: string;
    name: string;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}>;
