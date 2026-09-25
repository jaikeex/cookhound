import React, { useCallback } from 'react';
import { BaseInput } from '@/client/components/atoms/Input/Base';
import {
    InputError,
    inputErrorId
} from '@/client/components/atoms/Input/InputError';
import { InputLabel } from '@/client/components/atoms/Input/InputLabel';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';

export type NumberInputProps = Readonly<{
    allowDecimals?: boolean;
    defaultValue?: number | null;
    hideArrows?: boolean;
    min?: number;
    max?: number;
}> &
    Omit<FormInputProps, 'type' | 'defaultValue'>;

export const NumberInput: React.FC<NumberInputProps> = ({
    allowDecimals = false,
    className,
    defaultValue,
    disabled,
    error,
    hideArrows = false,
    id,
    label,
    min = 0,
    max,
    name,
    onChange,
    onKeyDown,
    ...props
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
            {label ? (
                <InputLabel htmlFor={id} text={label} disabled={disabled} />
            ) : null}

            <BaseInput
                {...props}
                type={'number'}
                defaultValue={defaultValue}
                className={classNames(
                    className,
                    hideArrows && 'no-number-arrows'
                )}
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? inputErrorId(id) : undefined}
                name={name}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                disabled={disabled}
                autoComplete={name}
                step={allowDecimals ? '0.01' : '1'}
                min={min}
                max={max}
            />
            {error ? (
                <InputError id={inputErrorId(id)} message={error} />
            ) : null}
        </div>
    );
};
