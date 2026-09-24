'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { classNames } from '@/client/utils';
import { Typography } from '@/client/components/atoms/Typography';
import { useEventListener, useOutsideClick } from '@/client/hooks';

type TooltipProps = Readonly<{
    className?: string;
    disabled?: boolean;
    position?:
        | 'top'
        | 'bottom'
        | 'left'
        | 'right'
        | 'top-start'
        | 'top-end'
        | 'bottom-start'
        | 'bottom-end'
        | 'left-start'
        | 'left-end'
        | 'right-start'
        | 'right-end';
    targetRef?: React.RefObject<HTMLElement | null>;
    text: string;
    visible?: boolean;
}> &
    React.PropsWithChildren<NonNullable<unknown>>;

const classConfig = {
    position: {
        top: 'left-1/2 transform -translate-x-1/2 bottom-full mb-2',
        bottom: 'left-1/2 transform -translate-x-1/2 top-full mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
        'top-start': 'left-0 bottom-full mb-2',
        'top-end': 'right-0 bottom-full mb-2',
        'bottom-start': 'left-0 top-full mt-2',
        'bottom-end': 'right-0 top-full mt-2',
        'left-start': 'right-full top-0 mr-2',
        'left-end': 'right-full bottom-0 mr-2',
        'right-start': 'left-full top-0 ml-2',
        'right-end': 'left-full bottom-0 ml-2'
    }
};

const TOUCH_DISMISS_MS = 2500;
const PASSIVE: AddEventListenerOptions = { passive: true };

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    className,
    disabled,
    position,
    targetRef,
    text,
    visible
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const dismissTimer = useRef<number | undefined>(undefined);

    const isControlled = visible !== undefined;
    const shouldShow = isControlled ? visible : isVisible;

    const hide = useCallback(() => {
        window.clearTimeout(dismissTimer.current);
        setIsVisible(false);
    }, []);

    const outsideClickRef = useOutsideClick<HTMLDivElement>(hide);

    const handleScrollDismiss = useCallback(() => {
        if (isVisible) {
            hide();
        }
    }, [isVisible, hide]);

    useEffect(() => {
        return () => window.clearTimeout(dismissTimer.current);
    }, []);

    const updatePosition = useCallback(() => {
        if (targetRef?.current && isControlled) {
            setTargetRect(targetRef.current.getBoundingClientRect());
        }
    }, [targetRef, isControlled]);

    useEventListener('scroll', handleScrollDismiss, undefined, PASSIVE);
    useEventListener('scroll', updatePosition, undefined, PASSIVE);
    useEventListener('resize', updatePosition, undefined, PASSIVE);

    // Initial measurement — the listeners above only fire on later changes
    useEffect(() => {
        updatePosition();
    }, [updatePosition, visible]);

    /*
     * Input type is checked per event rather than detected once per device,
     * so a mouse on a touchscreen laptop still gets hover behavior.
     */
    const handlePointerEnter = useCallback(
        (e: React.PointerEvent) => {
            if (!isControlled && !disabled && e.pointerType === 'mouse') {
                setIsVisible(true);
            }
        },
        [isControlled, disabled]
    );

    const handlePointerLeave = useCallback(
        (e: React.PointerEvent) => {
            if (!isControlled && e.pointerType === 'mouse') hide();
        },
        [isControlled, hide]
    );

    // Touch / pen: a tap toggles the tooltip, which then auto-dismisses.
    const handlePointerDown = useCallback(
        (e: React.PointerEvent) => {
            if (isControlled || disabled || e.pointerType === 'mouse') {
                return;
            }

            if (isVisible) {
                hide();
                return;
            }

            window.clearTimeout(dismissTimer.current);
            dismissTimer.current = window.setTimeout(hide, TOUCH_DISMISS_MS);
            setIsVisible(true);
        },
        [isControlled, disabled, isVisible, hide]
    );

    if (targetRef && visible !== undefined) {
        if (!shouldShow || !targetRect) return null;

        const getPositionStyle = () => {
            const pos = position ?? 'bottom';
            switch (pos) {
                case 'top':
                    return {
                        left: targetRect.left + targetRect.width / 2,
                        top: targetRect.top - 8,
                        transform: 'translateX(-50%) translateY(-100%)'
                    };
                case 'bottom':
                    return {
                        left: targetRect.left + targetRect.width / 2,
                        top: targetRect.bottom + 8,
                        transform: 'translateX(-50%)'
                    };
                case 'left':
                    return {
                        left: targetRect.left - 8,
                        top: targetRect.top + targetRect.height / 2,
                        transform: 'translateX(-100%) translateY(-50%)'
                    };
                case 'right':
                    return {
                        left: targetRect.right + 8,
                        top: targetRect.top + targetRect.height / 2,
                        transform: 'translateY(-50%)'
                    };
                case 'top-start':
                    return {
                        left: targetRect.left,
                        top: targetRect.top - 8,
                        transform: 'translateY(-100%)'
                    };
                case 'top-end':
                    return {
                        left: targetRect.right,
                        top: targetRect.top - 8,
                        transform: 'translateX(-100%) translateY(-100%)'
                    };
                case 'bottom-start':
                    return {
                        left: targetRect.left,
                        top: targetRect.bottom + 8
                    };
                case 'bottom-end':
                    return {
                        left: targetRect.right,
                        top: targetRect.bottom + 8,
                        transform: 'translateX(-100%)'
                    };
                case 'left-start':
                    return {
                        left: targetRect.left - 8,
                        top: targetRect.top,
                        transform: 'translateX(-100%)'
                    };
                case 'left-end':
                    return {
                        left: targetRect.left - 8,
                        top: targetRect.bottom,
                        transform: 'translateX(-100%) translateY(-100%)'
                    };
                case 'right-start':
                    return {
                        left: targetRect.right + 8,
                        top: targetRect.top
                    };
                case 'right-end':
                    return {
                        left: targetRect.right + 8,
                        top: targetRect.bottom,
                        transform: 'translateY(-100%)'
                    };
                default:
                    return {
                        left: targetRect.left + targetRect.width / 2,
                        top: targetRect.bottom + 8,
                        transform: 'translateX(-50%)'
                    };
            }
        };

        return (
            <div
                className={classNames(
                    'fixed z-50 px-2 py-2 text-xs bg-gray-300 rounded dark:bg-gray-800',
                    'transition-all duration-200 ease-in-out w-max max-w-64',
                    className
                )}
                style={getPositionStyle()}
            >
                <Typography align={'center'} variant={'body-sm'}>
                    {text}
                </Typography>
            </div>
        );
    }

    return (
        <div
            ref={outsideClickRef}
            className={`relative ${className} group`}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            onPointerDown={handlePointerDown}
        >
            {children}
            <div
                className={classNames(
                    'absolute bg-gray-300 dark:bg-gray-800 text-xs rounded py-2 px-2 z-10',
                    'transition-all duration-200 ease-in-out w-max max-w-64',
                    shouldShow ? 'opacity-100 block' : 'opacity-0 hidden',
                    classConfig.position[position ?? 'bottom'],
                    disabled ? 'hidden' : visible !== undefined ? 'block' : ''
                )}
            >
                <Typography align={'center'} variant={'body-sm'}>
                    {text}
                </Typography>
            </div>
        </div>
    );
};
