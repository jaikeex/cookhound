'use client';

import React from 'react';
import classnames from 'classnames';

export type BaseInputProps = Readonly<{
    className?: string;
}> &
    React.InputHTMLAttributes<HTMLInputElement>;

export const BaseInput: React.FC<BaseInputProps> = ({
    className,
    ...props
}) => {
    return <input {...props} className={classnames('base-input', className)} />;
};
