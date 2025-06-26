import React from 'react';
import { BaseInput, InputError, InputLabel } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';

export type TextInputProps = Readonly<{
    placeholder?: string;
}> &
    Omit<FormInputProps, 'type'>;

export const TextInput: React.FC<TextInputProps> = ({
    className,
    disabled,
    error,
    id,
    label,
    name,
    onChange,
    onKeyDown,
    placeholder
}) => {
    return (
        <div className={classNames('relative w-full', className)}>
            <InputLabel htmlFor={id} text={label} disabled={disabled} />
            <BaseInput
                type={'text'}
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
