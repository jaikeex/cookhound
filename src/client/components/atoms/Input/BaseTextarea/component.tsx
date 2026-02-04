'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { classNames } from '@/client/utils';

export type BaseTextareaProps = Readonly<{
    className?: string;
    defaultValue?: string | null;
    minRows?: number;
    maxRows?: number;
}> &
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'defaultValue'>;

export const BaseTextarea: React.FC<BaseTextareaProps> = ({
    className,
    defaultValue,
    minRows = 2,
    maxRows,
    onInput,
    style,
    ...props
}) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const adjustHeight = useCallback(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = 'auto';

        const computedStyle = window.getComputedStyle(textarea);
        const lineHeight = parseInt(computedStyle.lineHeight) || 20;

        const minHeight = lineHeight * minRows;
        const maxHeight = maxRows ? lineHeight * maxRows : Infinity;

        const newHeight = Math.min(
            Math.max(textarea.scrollHeight, minHeight),
            maxHeight
        );
        textarea.style.height = `${newHeight}px`;

        textarea.style.overflowY =
            textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [minRows, maxRows]);

    useEffect(() => {
        adjustHeight();
    }, [adjustHeight]);

    const handleInput = useCallback(
        (e: React.InputEvent<HTMLTextAreaElement>) => {
            adjustHeight();
            if (onInput) {
                onInput(e);
            }
        },
        [adjustHeight, onInput]
    );

    return (
        <textarea
            {...props}
            defaultValue={defaultValue ?? undefined}
            ref={textareaRef}
            onInput={handleInput}
            className={classNames(
                'base-input resize-none overflow-hidden',
                className
            )}
            style={{
                minHeight: `${parseInt(typeof window !== 'undefined' ? window.getComputedStyle(document.documentElement).fontSize : '16') * 1.5 * minRows || 16}px`,
                ...style
            }}
        />
    );
};
