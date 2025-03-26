import React from 'react';
import classnames from 'classnames';
import { Typography } from '@/client/components';

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
    return (
        <label
            className={classnames(
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
                type="checkbox"
                value=""
                className="sr-only peer"
                onChange={onChange}
                {...props}
            />
            <div
                className={classnames(
                    `relative w-11 h-6 rounded-full bg-gray-400 peer-focus:outline-none dark:bg-gray-700 dark:border-gray-600 peer-checked:bg-blue-600`,
                    `peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-['']`,
                    `after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all`
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
