import React from 'react';
import { BaseInput } from '@/client/components/atoms/Input/Base';
import { InputError } from '@/client/components/atoms/Input/InputError';
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
                type="password"
                name={name}
                disabled={disabled}
                autoComplete={autoComplete}
                onChange={onChange}
            />
            {error ? <InputError message={error} /> : null}
        </div>
    );
};
