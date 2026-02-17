import type React from 'react';

export type FormInputProps = Readonly<{
    autoComplete?: string;
    className?: string;
    defaultValue?: string;
    disabled?: boolean;
    error?: string;
    id: string;
    label?: string | React.ReactNode;
    name: string;
    onBlur?: React.FocusEventHandler<HTMLInputElement>;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
    value?: string;
}>;
