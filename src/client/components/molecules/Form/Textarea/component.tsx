import React from 'react';
import type { FocusEventHandler } from 'react';
import { InputError } from '@/client/components/atoms/Input/InputError';
import { InputLabel } from '@/client/components/atoms/Input/InputLabel';
import { BaseTextarea } from '@/client/components/atoms/Input/BaseTextarea';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';

export type TextareaProps = Readonly<{
    defaultValue?: string | null;
    onBlur?: FocusEventHandler<HTMLTextAreaElement>;
    maxLength?: number;
    onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    rows?: number;
}> &
    Omit<FormInputProps, 'defaultValue' | 'onChange' | 'onBlur'>;

export const Textarea: React.FC<TextareaProps> = ({
    className,
    defaultValue,
    disabled,
    error,
    id,
    label,
    maxLength,
    name,
    onChange,
    onKeyDown,
    placeholder,
    rows,
    ...props
}) => {
    return (
        <div className={classNames('w-full relative', className)}>
            <InputLabel htmlFor={id} text={label} disabled={disabled} />
            <BaseTextarea
                {...props}
                defaultValue={defaultValue}
                placeholder={placeholder}
                className={className}
                id={id}
                name={name}
                onChange={onChange}
                onKeyDown={onKeyDown}
                disabled={disabled}
                autoComplete={name}
                rows={rows}
                maxLength={maxLength}
            />
            {error ? <InputError message={error} /> : null}
        </div>
    );
};
