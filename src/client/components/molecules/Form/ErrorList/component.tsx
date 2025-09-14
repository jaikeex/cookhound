import { Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import React from 'react';

export type ErrorListProps = Readonly<{
    className?: string;
    errors: string[];
}>;

export const ErrorList: React.FC<ErrorListProps> = ({ errors, className }) => {
    return (
        <ul
            className={classNames(
                'text-red-700 dark:text-red-500 space-y-1',
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
