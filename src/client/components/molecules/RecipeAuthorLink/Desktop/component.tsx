'use client';

import { Avatar, Typography } from '@/client/components';
import { classNames, getAgeString } from '@/client/utils';
import React from 'react';
import { useLocale } from '@/client/store';
import { chqc } from '@/client/request/queryClient';
import Link from 'next/link';

export type RecipeAuthorLinkDesktopProps = Readonly<{
    authorId: number;
    className?: string;
    createdAt: Date;
    hideText?: boolean;
}>;

/**
 * RecipeAuthorLink component displays the cookbook icon button and author information
 * @param props - Component props
 */
export const RecipeAuthorLinkDesktop: React.FC<
    RecipeAuthorLinkDesktopProps
> = ({ authorId, createdAt, className }) => {
    const { t, locale } = useLocale();

    // Fetch author data only if authorId is not -1 (not deleted)
    const { data: author, isLoading: isLoadingAuthor } =
        chqc.user.useGetUserById(authorId, {
            enabled: authorId !== -1
        });

    const ageString = getAgeString(createdAt.toISOString(), locale);

    return (
        <div className={classNames('flex items-center gap-3', className)}>
            {authorId === -1 ? (
                <Typography variant="body-sm" color="muted">
                    {t('app.recipe.age')}: {ageString}
                </Typography>
            ) : isLoadingAuthor ? (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />

                    <div className="flex flex-col gap-1">
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                </div>
            ) : author ? (
                <React.Fragment>
                    <Link
                        href={`/user/${authorId}`}
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                    >
                        <Avatar
                            size="md"
                            src={author.avatarUrl || 'default'}
                            alt={author.username}
                        />
                    </Link>

                    <div className="flex flex-col">
                        <Typography variant="body-sm">
                            {author.username}
                        </Typography>

                        <Typography variant="body-xs" color="muted">
                            {t('app.recipe.age')}: {ageString}
                        </Typography>
                    </div>
                </React.Fragment>
            ) : (
                <Typography variant="body-sm" color="muted">
                    {t('app.recipe.age')}: {ageString}
                </Typography>
            )}
        </div>
    );
};
