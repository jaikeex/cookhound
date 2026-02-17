import React, { useCallback } from 'react';
import { BaseInput, InputError, InputLabel } from '@/client/components';
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
                name={name}
                onChange={handleChange}
                onKeyDown={onKeyDown}
                disabled={disabled}
                autoComplete={name}
                step={allowDecimals ? '0.01' : '1'}
                min={min}
                max={max}
            />
            {error ? <InputError message={error} /> : null}
        </div>
    );
};
