'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import classnames from 'classnames';
import { Typography } from '@/client/components';

type TooltipProps = Readonly<{
    className?: string;
    disabled?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    text: string;
    visible?: boolean;
    targetRef?: React.RefObject<HTMLElement | null>;
}> &
    React.PropsWithChildren<NonNullable<unknown>>;

const classConfig = {
    position: {
        top: 'left-1/2 transform -translate-x-1/2 bottom-full mb-2',
        bottom: 'left-1/2 transform -translate-x-1/2 top-full mt-2',
        left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    }
};

export const Tooltip: React.FC<TooltipProps> = ({
    children,
    disabled,
    className,
    position,
    text,
    visible,
    targetRef
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const internalRef = useRef<HTMLDivElement>(null);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    // Use controlled visibility if provided, otherwise use internal state
    const shouldShow = visible !== undefined ? visible : isVisible;

    // Track target element position when using targetRef
    useEffect(() => {
        if (targetRef?.current && visible !== undefined) {
            const updatePosition = () => {
                const rect = targetRef.current?.getBoundingClientRect();
                setTargetRect(rect || null);
            };

            updatePosition();
            window.addEventListener('scroll', updatePosition);
            window.addEventListener('resize', updatePosition);

            return () => {
                window.removeEventListener('scroll', updatePosition);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [targetRef, visible]);

    const handleMouseEnter = useCallback(() => {
        if (visible === undefined) {
            setIsVisible(true);
        }
    }, [visible]);

    const handleMouseLeave = useCallback(() => {
        if (visible === undefined) {
            setIsVisible(false);
        }
    }, [visible]);

    // When using targetRef with controlled visibility, render tooltip with absolute positioning
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
                className={classnames(
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

    // Default behavior with children (backward compatibility)
    return (
        <div
            ref={internalRef}
            className={`relative ${className} group`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {children}
            <div
                className={classnames(
                    'absolute hidden bg-gray-300 dark:bg-gray-800 text-xs rounded py-2 px-2 z-10',
                    'transition-all duration-200 ease-in-out w-max max-w-64',
                    shouldShow ? 'opacity-100' : 'opacity-0',
                    classConfig.position[position ?? 'bottom'],
                    disabled
                        ? ''
                        : visible !== undefined
                          ? 'block'
                          : 'group-hover:block'
                )}
            >
                <Typography align={'center'} variant={'body-sm'}>
                    {text}
                </Typography>
            </div>
        </div>
    );
};
