import React from 'react';
import { BaseInput, InputError, InputLabel } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import classNames from 'classnames';

export type TextInputProps = Readonly<{
    placeholder?: string;
    type?: 'text' | 'number';
}> &
    FormInputProps;

export const TextInput: React.FC<TextInputProps> = ({
    className,
    disabled,
    error,
    id,
    label,
    name,
    onChange,
    onKeyDown,
    placeholder,
    type = 'text'
}) => {
    return (
        <div className={classNames('w-full relative', className)}>
            <InputLabel htmlFor={id} text={label} disabled={disabled} />
            <BaseInput
                type={type}
                placeholder={placeholder}
                className={className}
                id={id}
                name={name}
                onChange={onChange}
                onKeyDown={onKeyDown}
                disabled={disabled}
                autoComplete={name}
                min={0}
            />
            {error ? <InputError message={error} /> : null}
        </div>
    );
};
