'use client';

import { Avatar } from '@/client/components/atoms/Avatar';
import React from 'react';
import { chqc } from '@/client/data';
import Link from 'next/link';
import { ROUTES } from '@/common/constants';

export type RecipeAuthorLinkMobileProps = Readonly<{
    authorId: number;
    className?: string;
}>;

export const RecipeAuthorLinkMobile: React.FC<RecipeAuthorLinkMobileProps> = ({
    authorId,
    className
}) => {
    const { data: author, isLoading: isLoadingAuthor } =
        chqc.user.useGetUserById(authorId, {
            enabled: authorId !== -1
        });

    return (
        <div className={className}>
            {authorId === -1 ? (
                <Avatar size="md" src="default" alt="Deleted user" />
            ) : isLoadingAuthor ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
            ) : author ? (
                <Link
                    href={ROUTES.user.detail(authorId)}
                    className="hover:opacity-80 transition-opacity"
                >
                    <Avatar
                        size="md"
                        src={author.avatarUrl || 'default'}
                        alt={author.username}
                    />
                </Link>
            ) : (
                <Avatar size="md" src="default" alt="Unknown user" />
            )}
        </div>
    );
};
