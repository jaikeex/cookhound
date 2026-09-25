import React from 'react';
import { BaseInput } from '@/client/components/atoms/Input/Base';
import {
    InputError,
    inputErrorId
} from '@/client/components/atoms/Input/InputError';
import { InputLabel } from '@/client/components/atoms/Input/InputLabel';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';

export type TextInputProps = Readonly<{
    label?: string;
    placeholder?: string;
}> &
    Omit<FormInputProps, 'type' | 'label'>;

export const TextInput: React.FC<TextInputProps> = ({
    className,
    defaultValue,
    disabled,
    error,
    id,
    label,
    name,
    onChange,
    onKeyDown,
    placeholder,
    ...props
}) => {
    return (
        <div className={classNames('relative w-full', className)}>
            {label ? (
                <InputLabel htmlFor={id} text={label} disabled={disabled} />
            ) : null}

            <BaseInput
                {...props}
                type={'text'}
                defaultValue={defaultValue}
                placeholder={placeholder}
                className={className}
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? inputErrorId(id) : undefined}
                name={name}
                onChange={onChange}
                onKeyDown={onKeyDown}
                disabled={disabled}
                autoComplete={name}
                min={0}
            />
            {error ? (
                <InputError id={inputErrorId(id)} message={error} />
            ) : null}
        </div>
    );
};
