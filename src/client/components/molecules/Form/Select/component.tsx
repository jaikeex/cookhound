import React from 'react';
import { BaseSelect, Icon, InputError, InputLabel } from '@/client/components';
import type { FormInputProps } from '@/client/components/molecules/Form/types';
import { classNames } from '@/client/utils';

export type SelectOption = Readonly<{
    value: string;
    label: string;
    disabled?: boolean;
}>;

export type SelectProps = Readonly<{
    options: ReadonlyArray<SelectOption>;
    placeholder?: string;
    defaultValue?: string | null;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLSelectElement>) => void;
}> &
    Omit<FormInputProps, 'type' | 'defaultValue' | 'onChange' | 'onKeyDown'>;

export const Select: React.FC<SelectProps> = ({
    className,
    defaultValue,
    disabled,
    error,
    id,
    label,
    name,
    onChange,
    onKeyDown,
    options,
    placeholder
}) => {
    return (
        <React.Fragment>
            {label ? (
                <InputLabel htmlFor={id} text={label} disabled={disabled} />
            ) : null}

            <div className={classNames('relative w-full', className)}>
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <Icon name="chevronDown" size={20} />
                </div>

                <BaseSelect
                    id={id}
                    name={name}
                    className={classNames('appearance-none pr-8', className)}
                    defaultValue={
                        defaultValue ?? (placeholder ? '' : undefined)
                    }
                    disabled={disabled}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                >
                    {placeholder ? (
                        <option value="" disabled hidden>
                            {placeholder}
                        </option>
                    ) : null}

                    {options.map(
                        ({
                            value,
                            label: optionLabel,
                            disabled: optionDisabled
                        }) => (
                            <option
                                key={value}
                                value={value}
                                disabled={optionDisabled}
                                className="max-w-full truncate"
                            >
                                {optionLabel}
                            </option>
                        )
                    )}
                </BaseSelect>

                {error ? <InputError message={error} /> : null}
            </div>
        </React.Fragment>
    );
};
