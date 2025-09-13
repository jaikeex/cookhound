'use client';

import React from 'react';
import { classNames } from '@/client/utils';

export type BaseInputProps = Readonly<{
    className?: string;
    defaultValue?: string | null;
    ref?: React.RefObject<HTMLInputElement> | null;
}> &
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref' | 'defaultValue'>;

export const BaseInput: React.FC<BaseInputProps> = ({
    className,
    defaultValue,
    ref,
    ...props
}) => {
    return (
        <input
            defaultValue={defaultValue ?? undefined}
            ref={ref}
            {...props}
            className={classNames('base-input', className)}
        />
    );
};
