import React from 'react';
import { Radio, Typography } from '@/client/components';
import { classNames } from '@/client/utils';

//~---------------------------------------------------------------------------------------------~//
//$                                           TYPES                                             $//
//~---------------------------------------------------------------------------------------------~//

export type RadioSelectOption = Readonly<{
    value: string;
    label: string;
    description?: string;
    defaultChecked?: boolean;
}>;

export type RadioSelectProps = Readonly<{
    name: string;
    label?: string;
    options: ReadonlyArray<RadioSelectOption>;
    className?: string;
    disabled?: boolean;
    error?: string;
    color?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
    column?: boolean;
}>;

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export const RadioSelect: React.FC<RadioSelectProps> = ({
    name,
    label,
    options,
    className,
    disabled,
    error,
    color = 'primary',
    size = 'md',
    column = false
}) => {
    return (
        <div className={classNames('flex flex-col gap-2', className)}>
            {label ? (
                <Typography variant="label" as="span">
                    {label}
                </Typography>
            ) : null}

            {/* Options */}
            <div
                className={classNames(
                    'flex gap-4 flex-wrap',
                    column ? 'flex-col' : ''
                )}
            >
                {options.map(
                    ({
                        value,
                        label: optionLabel,
                        defaultChecked,
                        description
                    }) => (
                        <React.Fragment key={value}>
                            <label className="inline-flex items-center gap-1 cursor-pointer">
                                <Radio
                                    name={name}
                                    value={value}
                                    color={color}
                                    size={size}
                                    disabled={disabled}
                                    defaultChecked={defaultChecked}
                                />

                                <Typography variant="label" as="span">
                                    {optionLabel}
                                </Typography>
                            </label>
                            {description ? (
                                <Typography
                                    variant="body-xs"
                                    as="span"
                                    className="text-gray-800 dark:text-gray-400"
                                >
                                    {description}
                                </Typography>
                            ) : null}
                        </React.Fragment>
                    )
                )}
            </div>

            {error ? (
                <Typography variant="error" as="span">
                    {error}
                </Typography>
            ) : null}
        </div>
    );
};
