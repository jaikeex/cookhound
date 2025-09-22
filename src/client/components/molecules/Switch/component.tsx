'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { classNames } from '@/client/utils';
import { Typography } from '@/client/components';
import { useKeyPress } from '@/client/hooks';

export type SwitchProps = Readonly<{
    className?: string;
    labelRight?: string;
    labelLeft?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    stretch?: boolean;
}> &
    React.InputHTMLAttributes<HTMLInputElement>;

export const Switch: React.FC<SwitchProps> = ({
    className,
    labelRight,
    labelLeft,
    onChange,
    stretch = false,
    ...props
}) => {
    const [checked, setChecked] = useState(props.checked);
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setChecked(event.target.checked);
            onChange?.(event);
        },
        [onChange]
    );

    const handleFocus = useCallback(() => {
        setIsFocused(true);
    }, []);

    const handleBlur = useCallback(() => {
        setIsFocused(false);
    }, []);

    const handleKeyPress = useCallback(
        (event: KeyboardEvent) => {
            if (event.key === 'Enter' && isFocused) {
                setChecked(!checked);
                onChange?.({
                    target: {
                        checked: !checked
                    }
                } as React.ChangeEvent<HTMLInputElement>);
            }
        },
        [checked, onChange, isFocused]
    );

    useKeyPress('Enter', handleKeyPress);

    useEffect(() => {
        setChecked(props.checked);
    }, [props.checked]);

    return (
        <label
            className={classNames(
                `inline-flex items-center cursor-pointer`,
                stretch ? 'w-full justify-between' : '',
                className
            )}
        >
            {labelLeft ? (
                <Typography variant="label" className="me-3">
                    {labelLeft}
                </Typography>
            ) : null}

            <input
                {...props}
                type="checkbox"
                value=""
                className="sr-only peer"
                onChange={handleChange}
                checked={checked}
                onFocus={handleFocus}
                onBlur={handleBlur}
            />
            <span
                role="switch"
                aria-checked={checked}
                aria-disabled={props.disabled}
                className={classNames(
                    'relative w-11 h-6 rounded-full transition-colors',
                    'bg-gray-400 peer-checked:bg-blue-600 dark:bg-gray-700 dark:peer-checked:bg-blue-600',
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500',
                    'after:absolute after:top-[2px] after:start-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform',
                    'peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full'
                )}
            />

            {labelRight ? (
                <Typography variant="label" className="ms-3">
                    {labelRight}
                </Typography>
            ) : null}
        </label>
    );
};
