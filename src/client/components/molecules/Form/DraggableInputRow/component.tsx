'use client';

/* eslint-disable react/jsx-no-bind */

import React, { useCallback, useRef } from 'react';
import { Icon, IconButton } from '@/client/components';
import { Reorder, useDragControls } from 'framer-motion';
import type { PanInfo } from 'framer-motion';

type DraggableInputRowProps = Readonly<{
    className?: string;
    disableDrag?: boolean;
    disableRemove?: boolean;
    hideRemove?: boolean;
    index: number;
    onRemove?: () => void;
    /**
     * Optional callback fired when the drag ends (after the internal cleanup).
     * Mirrors the `onDragEnd` signature from `framer-motion`'s `Reorder.Item`.
     */
    onDragEnd?: (event: PointerEvent, info: PanInfo) => void;
}> &
    React.PropsWithChildren<NonNullable<unknown>>;

export const DraggableInputRow: React.FC<DraggableInputRowProps> = ({
    children,
    className,
    disableDrag,
    disableRemove,
    hideRemove,
    index,
    onRemove,
    onDragEnd
}) => {
    const controls = useDragControls();
    const originalBodyOverflow = useRef<string>('');

    const handleDragStart = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault(); // Prevents the input texts from being selected.

            if (!disableDrag) {
                // This (together with the handleDragEnd) prevents the body from scrolling when the
                // drag starts. this is needed expecially for mobile screens, since the screen
                // scrolling while attempting to drag the input row is pure hell.
                originalBodyOverflow.current =
                    document.documentElement.style.overflow;
                document.documentElement.style.overflow = 'hidden';

                controls.start(e);
            }
        },
        [controls, disableDrag]
    );

    const handleDragEnd = useCallback(() => {
        document.documentElement.style.overflow = originalBodyOverflow.current;
    }, []);

    return (
        <Reorder.Item
            value={index}
            className={`flex items-center gap-2 ${className}`}
            dragListener={false}
            dragControls={controls}
            onDragEnd={(event, info) => {
                handleDragEnd();
                onDragEnd?.(event as unknown as PointerEvent, info);
            }}
        >
            {children}
            <div className={'flex items-center'}>
                <Icon
                    name={'drag'}
                    className={`cursor-move ${disableDrag ? 'opacity-50 pointer-events-none' : 'touch-none'}`}
                    size={20}
                    onPointerDown={handleDragStart}
                />
                {hideRemove || !onRemove ? null : (
                    <IconButton
                        tabIndex={-1}
                        disabled={disableRemove}
                        className={'min-w-5'}
                        icon={'close'}
                        size={12}
                        onClick={onRemove}
                    />
                )}
            </div>
        </Reorder.Item>
    );
};
