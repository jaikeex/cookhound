import { Typography } from '@/client/components/atoms/Typography';
import { classNames } from '@/client/utils';
import React from 'react';

export type ErrorListProps = Readonly<{
    className?: string;
    errors: string[];
}>;

export const ErrorList: React.FC<ErrorListProps> = ({ errors, className }) => {
    return (
        <ul
            role="alert"
            className={classNames(
                'text-red-700 dark:text-red-500 space-y-1',
                errors.length === 0 ? 'hidden' : '',
                className
            )}
        >
            {errors.map((error, index) => (
                <Typography variant={'label'} key={index} as="li">
                    &bull;&nbsp;{error}
                </Typography>
            ))}
        </ul>
    );
};
