'use client';

import React, {
    type ReactNode,
    useRef,
    useEffect,
    useState,
    useCallback
} from 'react';
import { Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import type { RecipeForDisplayDTO } from '@/common/types';
import { RecipeLink } from '@/client/components';
import { useKeyPress } from '@/client/hooks';

export type SearchSuggestionBoxProps = Readonly<{
    suggestions: RecipeForDisplayDTO[];
    isEmpty: boolean;
    isLoading: boolean;
    error?: string | null;
    className?: string;
    onClose?: () => void;
    onSuggestionClick?: () => void;
    title: string | ReactNode;
    emptyMessage: string;
}>;

export const SearchSuggestionBox: React.FC<SearchSuggestionBoxProps> = ({
    suggestions,
    isEmpty,
    error,
    isLoading,
    className,
    onClose,
    onSuggestionClick,
    title,
    emptyMessage
}) => {
    const FIXED_CONTENT_HEIGHT = 150; // Equivalent to 5 suggestion items

    const [focusedIndex, setFocusedIndex] = useState<number>(-1);
    const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    //|-----------------------------------------------------------------------------------------|//
    //?                                   KEYBOARD NAVIGATION                                   ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        setFocusedIndex(-1);
        linkRefs.current = [];
    }, [suggestions]);

    useEffect(() => {
        if (focusedIndex >= 0 && linkRefs.current[focusedIndex]) {
            linkRefs.current[focusedIndex]?.focus();
        }
    }, [focusedIndex]);

    useKeyPress(
        'ArrowDown',
        () => {
            if (suggestions.length === 0) return;
            setFocusedIndex((prev) =>
                prev < suggestions.length - 1 ? prev + 1 : prev
            );
        },
        {
            preventDefault: true,
            stopPropagation: true
        }
    );

    useKeyPress(
        'ArrowUp',
        () => {
            if (suggestions.length === 0) return;
            setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        },
        {
            preventDefault: true,
            stopPropagation: true
        }
    );

    useKeyPress(
        'Enter',
        () => {
            if (focusedIndex >= 0 && linkRefs.current[focusedIndex]) {
                linkRefs.current[focusedIndex]?.click();
            }
        },
        {
            preventDefault: true,
            stopPropagation: true
        }
    );

    useKeyPress(
        'Escape',
        () => {
            onClose?.();
        },
        {
            preventDefault: true,
            stopPropagation: true
        }
    );

    useKeyPress('Tab', () => {
        if (focusedIndex === suggestions.length - 1) {
            onClose?.();
        }
    });

    //|-----------------------------------------------------------------------------------------|//
    //?                                         UTILITY                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const createLinkRef = useCallback(
        (index: number) => (el: HTMLAnchorElement | null) => {
            linkRefs.current[index] = el;
        },
        []
    );

    const handleLinkFocus = useCallback(
        (index: number) => () => {
            setFocusedIndex(index);
        },
        []
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                        CONTENT                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const renderContent = () => {
        if (error) {
            return (
                <div className="flex items-center justify-center h-full px-4">
                    <Typography
                        variant="body-sm"
                        className="text-center text-danger-600 dark:text-danger-400"
                    >
                        {error}
                    </Typography>
                </div>
            );
        }

        if (isEmpty || isLoading) {
            return (
                <div className="flex items-center justify-center h-full px-4">
                    <Typography
                        variant="body-sm"
                        className="text-center text-gray-500 dark:text-gray-400"
                    >
                        {emptyMessage}
                    </Typography>
                </div>
            );
        }

        return (
            <div className="py-1">
                {suggestions.map((s, index) => (
                    <RecipeLink
                        onFocus={handleLinkFocus(index)}
                        key={s.id}
                        recipe={s}
                        onClick={onSuggestionClick}
                        className={classNames('px-2 py-1 mx-2')}
                        ref={createLinkRef(index)}
                    />
                ))}
            </div>
        );
    };

    //|-----------------------------------------------------------------------------------------|//
    //?                                         RETURN                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    return (
        <div
            ref={containerRef}
            className={classNames(
                'absolute left-0 right-0 mt-1 rounded-md shadow-lg top-full z-[9000] sheet',
                'animate-fade-in overflow-hidden',
                className
            )}
        >
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                {title}
            </div>

            {/* Content */}
            <div
                className="overflow-hidden"
                style={{ height: `${FIXED_CONTENT_HEIGHT}px` }}
            >
                {renderContent()}
            </div>
        </div>
    );
};
