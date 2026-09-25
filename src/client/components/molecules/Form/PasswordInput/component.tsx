import React from 'react';
import { BaseInput } from '@/client/components/atoms/Input/Base';
import {
    InputError,
    inputErrorId
} from '@/client/components/atoms/Input/InputError';
import { InputLabel } from '@/client/components/atoms/Input/InputLabel';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';

export type PasswordInputProps = FormInputProps;

export const PasswordInput: React.FC<PasswordInputProps> = ({
    autoComplete,
    className,
    disabled,
    error,
    id,
    label,
    name,
    onChange,
    ...props
}) => {
    return (
        <div className={classNames('w-full relative', className)}>
            {label ? (
                <InputLabel htmlFor={id} text={label} disabled={disabled} />
            ) : null}

            <BaseInput
                {...props}
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? inputErrorId(id) : undefined}
                type="password"
                name={name}
                disabled={disabled}
                autoComplete={autoComplete}
                onChange={onChange}
            />
            {error ? (
                <InputError id={inputErrorId(id)} message={error} />
            ) : null}
        </div>
    );
};
