'use client';

import React from 'react';
import classnames from 'classnames';

export type BaseInputProps = Readonly<{
    className?: string;
    ref?: React.RefObject<HTMLInputElement> | null;
}> &
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref'>;

export const BaseInput: React.FC<BaseInputProps> = ({
    className,
    ref,
    ...props
}) => {
    return (
        <input
            ref={ref}
            {...props}
            className={classnames('base-input', className)}
        />
    );
};
