'use client';

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useLayoutEffect
} from 'react';
import { classNames } from '@/client/utils';
import { useEventListener, usePathnameChangeListener } from '@/client/hooks';

export type PopupPlacement =
    | 'top'
    | 'top-start'
    | 'top-end'
    | 'right'
    | 'right-start'
    | 'right-end'
    | 'bottom'
    | 'bottom-start'
    | 'bottom-end'
    | 'left'
    | 'left-start'
    | 'left-end';

export type PopupProps = Readonly<{
    className?: string;
    closeOnClickOutside?: boolean;
    closeOnEscape?: boolean;
    content: React.ReactNode;
    contentClassName?: string;
    disabled?: boolean;
    offset?: number;
    onOpen?: () => void;
    onClose?: () => void;
    placement?: PopupPlacement;
}> &
    React.PropsWithChildren;

const ANIMATIONS = {
    fadeIn: 'animate-fade-in',
    fadeOut: 'animate-fade-out'
};

export const Popup: React.FC<PopupProps> = ({
    children,
    className,
    closeOnClickOutside = true,
    closeOnEscape = true,
    content,
    contentClassName,
    disabled = false,
    offset = 8,
    onOpen,
    onClose,
    placement = 'bottom'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [animationClass, setAnimationClass] = useState(ANIMATIONS.fadeIn);
    const [position, setPosition] = useState<
        { top: number; left: number } | undefined
    >();

    const triggerRef = useRef<HTMLDivElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (isOpen) {
            const newPosition = calculatePosition(
                placement,
                triggerRef,
                popupRef,
                offset
            );
            setPosition(newPosition);
        }
    }, [isOpen, placement, offset]);

    const handleToggle = useCallback(() => {
        if (disabled) return;

        const timeout = isOpen ? 140 : 0;
        const newIsOpen = !isOpen;

        // Timeout for the state change is needed to display the fade out animation.
        // The time is purposefully set to 10 ms less than the animation duration.
        setTimeout(() => {
            setIsOpen(newIsOpen);
        }, timeout);

        if (newIsOpen) {
            setAnimationClass(ANIMATIONS.fadeIn);
            onOpen?.();
        } else {
            setAnimationClass(ANIMATIONS.fadeOut);
            onClose?.();
        }
    }, [disabled, isOpen, onOpen, onClose]);

    const handleClose = useCallback(() => {
        setIsOpen(false);
        onClose?.();
    }, [onClose]);

    // TODO: Use useOutsideClick hook
    useEffect(() => {
        if (!isOpen || !closeOnClickOutside) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                triggerRef.current &&
                popupRef.current &&
                !triggerRef.current.contains(event.target as Node) &&
                !popupRef.current.contains(event.target as Node)
            ) {
                handleToggle();
            }
        };

        document.addEventListener('mouseup', handleClickOutside);
        return () =>
            document.removeEventListener('mouseup', handleClickOutside);
    }, [isOpen, closeOnClickOutside, handleToggle]);

    const handleEscape = useCallback(
        (event: KeyboardEvent) => {
            if (!isOpen || !closeOnEscape) return;
            if (event.key === 'Escape') handleToggle();
        },
        [isOpen, closeOnEscape, handleToggle]
    );

    const handlePathnameChange = useCallback(() => {
        handleClose();
    }, [handleClose]);

    usePathnameChangeListener({
        onChange: handlePathnameChange
    });

    useEventListener('keydown', handleEscape);
    useEventListener('resize', () => {
        if (isOpen) {
            const newPosition = calculatePosition(
                placement,
                triggerRef,
                popupRef,
                offset
            );
            setPosition(newPosition);
        }
    });

    return (
        <>
            {/* --------------------------------------- */}
            {/* ----------- TRIGGER ELEMENT ----------- */}
            {/* --------------------------------------- */}
            <div
                ref={triggerRef}
                onClick={handleToggle}
                className={classNames('inline-block cursor-pointer', className)}
            >
                {children}
            </div>

            {/* --------------------------------------- */}
            {/* ------------ POPUP CONTENT ------------ */}
            {/* --------------------------------------- */}
            {isOpen ? (
                <div
                    ref={popupRef}
                    className={classNames(
                        'fixed z-50 rounded sheet px-8 py-6',
                        animationClass,
                        contentClassName
                    )}
                    style={{
                        top: `${position?.top}px`,
                        left: `${position?.left}px`
                    }}
                >
                    {content}
                </div>
            ) : null}
        </>
    );
};

function calculatePosition(
    placement: PopupPlacement,
    triggerRef: React.RefObject<HTMLDivElement | null>,
    popupRef: React.RefObject<HTMLDivElement | null>,
    offset: number
) {
    if (!triggerRef.current || !popupRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
    };

    let top = 0;
    let left = 0;

    switch (placement) {
        case 'top':
            top = triggerRect.top - popupRect.height - offset;
            left = triggerRect.left + (triggerRect.width - popupRect.width) / 2;
            break;
        case 'top-start':
            top = triggerRect.top - popupRect.height - offset;
            left = triggerRect.left;
            break;
        case 'top-end':
            top = triggerRect.top - popupRect.height - offset;
            left = triggerRect.right - popupRect.width;
            break;
        case 'right':
            top = triggerRect.top + (triggerRect.height - popupRect.height) / 2;
            left = triggerRect.right + offset;
            break;
        case 'right-start':
            top = triggerRect.top;
            left = triggerRect.right + offset;
            break;
        case 'right-end':
            top = triggerRect.bottom - popupRect.height;
            left = triggerRect.right + offset;
            break;
        case 'bottom':
            top = triggerRect.bottom + offset;
            left = triggerRect.left + (triggerRect.width - popupRect.width) / 2;
            break;
        case 'bottom-start':
            top = triggerRect.bottom + offset;
            left = triggerRect.left;
            break;
        case 'bottom-end':
            top = triggerRect.bottom + offset;
            left = triggerRect.right - popupRect.width;
            break;
        case 'left':
            top = triggerRect.top + (triggerRect.height - popupRect.height) / 2;
            left = triggerRect.left - popupRect.width - offset;
            break;
        case 'left-start':
            top = triggerRect.top;
            left = triggerRect.left - popupRect.width - offset;
            break;
        case 'left-end':
            top = triggerRect.bottom - popupRect.height;
            left = triggerRect.left - popupRect.width - offset;
            break;
    }

    // Adjust for viewport boundaries
    if (left < 0) {
        left = 8;
    } else if (left + popupRect.width > viewport.width) {
        left = viewport.width - popupRect.width - 8;
    }

    if (top < 0) {
        top = 8;
    } else if (top + popupRect.height > viewport.height) {
        top = viewport.height - popupRect.height - 8;
    }

    return { top, left };
}
