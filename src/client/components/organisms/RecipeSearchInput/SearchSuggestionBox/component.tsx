import React, { type ReactNode } from 'react';
import Link from 'next/link';
import { Loader, Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import Image from 'next/image';
import type { RecipeForDisplayDTO } from '@/common/types';

export type SearchSuggestionBoxProps = Readonly<{
    suggestions: RecipeForDisplayDTO[];
    isLoading: boolean;
    isEmpty: boolean;
    error?: string | null;
    className?: string;
    onSuggestionClick?: () => void;
    title: string | ReactNode;
    emptyMessage: string;
}>;

export const SearchSuggestionBox: React.FC<SearchSuggestionBoxProps> = ({
    suggestions,
    isLoading,
    isEmpty,
    error,
    className,
    onSuggestionClick,
    title,
    emptyMessage
}) => {
    const FIXED_CONTENT_HEIGHT = 150; // Equivalent to 5 suggestion items

    const SuggestionItem: React.FC<{
        readonly suggestion: RecipeForDisplayDTO;
    }> = ({ suggestion }) => (
        <Link
            href={`/recipe/${suggestion.displayId}`}
            onClick={onSuggestionClick}
            className="flex items-center gap-2 px-4 py-1 text-inherit text-start"
        >
            <Image
                src={suggestion.imageUrl}
                alt={suggestion.title}
                width={24}
                height={24}
            />
            <Typography variant="body-sm" className="text-ellipsis">
                {suggestion.title}
            </Typography>
        </Link>
    );

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <Loader />
                </div>
            );
        }

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

        if (isEmpty) {
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
                    <SuggestionItem key={s.id} suggestion={s} />
                ))}
            </div>
        );
    };

    return (
        <div
            className={classNames(
                'absolute left-0 right-0 mt-1 rounded-md shadow-lg top-full z-[9000] sheet',
                'animate-fade-in',
                className
            )}
        >
            {/* Header */}
            <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                {title}
            </div>

            {/* Content */}
            <div
                className="overflow-y-auto"
                style={{ height: `${FIXED_CONTENT_HEIGHT}px` }}
            >
                {renderContent()}
            </div>
        </div>
    );
};
