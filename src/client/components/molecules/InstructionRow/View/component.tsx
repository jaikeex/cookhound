'use client';

import React, { useCallback } from 'react';
import { Typography } from '@/client/components/atoms/Typography';
import { classNames } from '@/client/utils';

export type InstructionRowViewProps = Readonly<{
    checked?: boolean;
    className?: string;
    disabled?: boolean;
    index: number;
    instruction: string;
    onToggle?: (index: number) => void;
}>;

export const InstructionRowView: React.FC<InstructionRowViewProps> = ({
    checked = false,
    className,
    disabled = false,
    index,
    instruction,
    onToggle
}) => {
    const handleToggle = useCallback(() => {
        onToggle?.(index);
    }, [index, onToggle]);

    const handleClick = useCallback(() => {
        if (disabled) return;

        // Steps are text that people can select and copy. The mouseup ending a
        // selection also fires a click, which must not tick the step off.
        const selection = window.getSelection();
        if (selection && !selection.isCollapsed) return;

        handleToggle();
    }, [disabled, handleToggle]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (disabled) {
                return;
            }

            if (event.key !== ' ' && event.key !== 'Enter') {
                return;
            }

            // Space would otherwise scroll the page.
            event.preventDefault();
            handleToggle();
        },
        [disabled, handleToggle]
    );

    return (
        <div
            role={disabled ? undefined : 'checkbox'}
            aria-checked={disabled ? undefined : checked}
            tabIndex={disabled ? undefined : 0}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={classNames(
                'rounded-sm outline-none',
                disabled
                    ? 'cursor-default'
                    : 'cursor-pointer focus-visible:ring-2 focus-visible:ring-primary-500',
                className
            )}
        >
            <Typography
                variant="body"
                className={classNames(
                    'transition-colors',
                    checked && 'text-gray-300 dark:text-gray-600'
                )}
            >
                {instruction}
            </Typography>
        </div>
    );
};
