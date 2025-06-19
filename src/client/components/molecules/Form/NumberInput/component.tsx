import React, { useCallback } from 'react';
import { BaseInput, InputError, InputLabel } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import classNames from 'classnames';

export type NumberInputProps = Readonly<{
    allowDecimals?: boolean;
    max?: number;
}> &
    Omit<FormInputProps, 'type'>;

export const NumberInput: React.FC<NumberInputProps> = ({
    className,
    disabled,
    error,
    id,
    label,
    name,
    onChange,
    onKeyDown,
    allowDecimals = false,
    max
}) => {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!allowDecimals) {
                e.target.value = Math.round(
                    Number(e.target.value.replace(/[^0-9]/g, ''))
                ).toString();
            }

            onChange && onChange(e);
        },
        [allowDecimals, onChange]
    );

    return (
        <div className={classNames('relative w-full', className)}>
            <InputLabel htmlFor={id} text={label} disabled={disabled} />
            <BaseInput
                type={'number'}
                className={className}
                id={id}
                name={name}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                disabled={disabled}
                autoComplete={name}
                step={allowDecimals ? '0.01' : '1'}
                min={0}
                max={max}
            />
            {error ? <InputError message={error} /> : null}
        </div>
    );
};
