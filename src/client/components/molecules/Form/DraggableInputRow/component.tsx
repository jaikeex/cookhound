'use client';

import React, { useCallback } from 'react';
import { Icon, IconButton } from '@/client/components';
import { Reorder, useDragControls, type PanInfo } from 'framer-motion';
import { useDisableMobileScroll, useKeyboardOpen } from '@/client/hooks';

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
    const isKeyboardOpen = useKeyboardOpen();
    const { disableMobileScroll, enableMobileScroll } =
        useDisableMobileScroll();
    const controls = useDragControls();

    const handleDragStart = useCallback(
        (e: React.PointerEvent) => {
            e.preventDefault(); // Prevents the input texts from being selected.

            if (!disableDrag) {
                const activeElement =
                    document.activeElement as HTMLElement | null;

                const hadFocus =
                    !!activeElement &&
                    (activeElement.tagName === 'INPUT' ||
                        activeElement.tagName === 'TEXTAREA');

                // Blur any currently focused input before the drag starts, if not done here, the drag can
                // become stuck if any item is dragged over any other FOCUSED item. Do not ask me why...
                if (hadFocus) {
                    activeElement.blur();
                }

                const startDrag = () => {
                    // This (together with the handleDragEnd) prevents the body from scrolling when the
                    // drag starts. this is needed expecially for mobile screens, since the screen
                    // scrolling while attempting to drag the input row is pure hell.
                    disableMobileScroll();
                    controls.start(e);
                };

                //~This is important
                // the timeout plays a crucial role, because (for reasons to me unknown), when drag is iniated
                // while the mobile keyboard is open, the the resulting viewport change causes the entire drag
                // to be fucked beyond oblivion. This delay was set by trial an error, it is not a bullet proof
                // solution but it prevents most cases.
                if (isKeyboardOpen) {
                    setTimeout(startDrag, 300);
                } else {
                    startDrag();
                }
            }
        },
        [controls, disableDrag, disableMobileScroll, isKeyboardOpen]
    );

    const handleDragEnd = useCallback(
        (event: PointerEvent, info: PanInfo) => {
            enableMobileScroll();
            onDragEnd?.(event as unknown as PointerEvent, info);
        },
        [enableMobileScroll, onDragEnd]
    );

    return (
        <Reorder.Item
            value={index}
            className={`flex items-center gap-2 ${className}`}
            dragListener={false}
            dragControls={controls}
            onDragEnd={handleDragEnd}
        >
            {children}
            <div className={'flex items-center gap-1 ml-1'}>
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
