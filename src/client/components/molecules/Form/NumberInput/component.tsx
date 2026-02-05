import React, { useCallback } from 'react';
import { BaseInput, InputError, InputLabel } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';

export type NumberInputProps = Readonly<{
    allowDecimals?: boolean;
    defaultValue?: number | null;
    max?: number;
}> &
    Omit<FormInputProps, 'type' | 'defaultValue'>;

export const NumberInput: React.FC<NumberInputProps> = ({
    allowDecimals = false,
    className,
    defaultValue,
    disabled,
    error,
    id,
    label,
    max,
    name,
    onChange,
    onKeyDown
}) => {
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!allowDecimals) {
                e.target.value = Math.round(
                    Number(e.target.value.replace(/[^0-9]/g, ''))
                ).toString();
            }

            onChange?.(e);
        },
        [allowDecimals, onChange]
    );

    return (
        <div className={classNames('relative w-full', className)}>
            <InputLabel htmlFor={id} text={label} disabled={disabled} />
            <BaseInput
                type={'number'}
                defaultValue={defaultValue}
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
