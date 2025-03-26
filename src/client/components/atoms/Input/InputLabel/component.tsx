import classNames from 'classnames';
import React from 'react';
import { Typography } from '@/client/components';

export type InputLabelProps = Readonly<{
    className?: string;
    disabled?: boolean;
    htmlFor: string;
    text: string;
}>;

export const InputLabel: React.FC<InputLabelProps> = ({
    className,
    disabled,
    htmlFor,
    text
}) => {
    return (
        <Typography
            as="label"
            variant="label"
            htmlFor={htmlFor}
            className={classNames(
                `block text-gray-700 dark:text-gray-200`,
                className,
                disabled ? 'opacity-50' : ''
            )}
        >
            {text}
        </Typography>
    );
};
