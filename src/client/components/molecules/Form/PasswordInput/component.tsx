import React from 'react';
import { BaseInput, InputError, InputLabel } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';

export type PasswordInputProps = FormInputProps;

export const PasswordInput: React.FC<PasswordInputProps> = ({
    className,
    disabled,
    error,
    id,
    label,
    name,
    onChange,
    autoComplete
}) => {
    return (
        <div className={classNames('w-full relative', className)}>
            <InputLabel htmlFor={id} text={label} disabled={disabled} />
            <BaseInput
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
