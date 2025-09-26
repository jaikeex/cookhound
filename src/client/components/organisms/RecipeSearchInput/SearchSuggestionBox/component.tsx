import React, { type ReactNode } from 'react';
import { Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import type { RecipeForDisplayDTO } from '@/common/types';
import { RecipeLink } from '@/client/components';

export type SearchSuggestionBoxProps = Readonly<{
    suggestions: RecipeForDisplayDTO[];
    isEmpty: boolean;
    isLoading: boolean;
    error?: string | null;
    className?: string;
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
    onSuggestionClick,
    title,
    emptyMessage
}) => {
    const FIXED_CONTENT_HEIGHT = 150; // Equivalent to 5 suggestion items

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
                {suggestions.map((s) => (
                    <RecipeLink
                        key={s.id}
                        recipe={s}
                        onClick={onSuggestionClick}
                        className="px-4 py-1"
                    />
                ))}
            </div>
        );
    };

    return (
        <div
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
