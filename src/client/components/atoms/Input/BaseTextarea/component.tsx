'use client';

import React from 'react';
import classnames from 'classnames';

export type BaseTextareaProps = Readonly<{
    className?: string;
}> &
    React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const BaseTextarea: React.FC<BaseTextareaProps> = ({
    className,
    ...props
}) => {
    return (
        <textarea {...props} className={classnames('base-input', className)} />
    );
};
