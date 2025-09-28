import React from 'react';
import { classNames } from '@/client/utils';

export type BaseSelectProps = Readonly<{
    className?: string;
    defaultValue?: string | null;
    ref?: React.RefObject<HTMLSelectElement> | null;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLSelectElement>) => void;
}> &
    Omit<
        React.SelectHTMLAttributes<HTMLSelectElement>,
        'ref' | 'defaultValue' | 'onChange' | 'onKeyDown'
    >;

export const BaseSelect: React.FC<BaseSelectProps> = ({
    className,
    defaultValue,
    ref,
    children,
    ...props
}) => {
    return (
        <select
            defaultValue={defaultValue ?? undefined}
            ref={ref}
            {...props}
            className={classNames('base-input', className)}
        >
            {children}
        </select>
    );
};
