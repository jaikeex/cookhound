import { classNames } from '@/client/utils';
import React from 'react';

export type InputErrorProps = Readonly<{
    className?: string;
    id?: string;
    message: string;
}>;

export const inputErrorId = (inputId?: string) =>
    inputId ? `${inputId}-error` : undefined;

export const InputError: React.FC<InputErrorProps> = ({
    className,
    id,
    message
}) => {
    return (
        <p
            id={id}
            className={classNames(
                `absolute top-0 right-0 text-red-700 dark:text-red-500 text-sm font-normal text-end`,
                className
            )}
        >
            {message}
        </p>
    );
};
