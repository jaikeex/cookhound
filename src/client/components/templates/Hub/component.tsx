import React from 'react';
import Link from 'next/link';
import { Typography } from '@/client/components/atoms/Typography';
import { RecipeCardList } from '@/client/components/molecules/List/RecipeCardList';
import { HUB_UI, buildHubPath, type HubSibling } from '@/common/constants';
import { classNames } from '@/client/utils';
import type { RecipeForDisplayDTO } from '@/common/types';

export type HubTemplateProps = Readonly<{
    filterHref: string;
    hubSlug: string;
    intro: string;
    page: number;
    pageCount: number;
    recipes: RecipeForDisplayDTO[];
    siblings: HubSibling[];
    title: string;
}>;

export const HubTemplate: React.FC<HubTemplateProps> = ({
    filterHref,
    hubSlug,
    intro,
    page,
    pageCount,
    recipes,
    siblings,
    title
}) => {
    const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

    return (
        <article className="mx-auto w-full max-w-7xl pb-12">
            <header className="mt-2 mb-6 md:mt-6">
                <Typography as="h1" variant="heading-xl">
                    {title}
                </Typography>
                <Typography as="p" variant="body" className="mt-3 max-w-3xl">
                    {intro}
                </Typography>
            </header>

            {siblings.length > 0 && (
                <nav
                    aria-label={HUB_UI.relatedHeading}
                    className="mb-8 flex flex-wrap gap-2"
                >
                    {siblings.map((sibling) => (
                        <Link
                            key={sibling.hubSlug}
                            href={`/recepty/${sibling.hubSlug}`}
                            className={classNames(
                                'rounded-full px-3 py-1 text-sm transition-colors',
                                'bg-sheet-200 text-sheet-800 hover:bg-sheet-300',
                                'dark:bg-sheet-800 dark:text-sheet-200 dark:hover:bg-sheet-700'
                            )}
                        >
                            {sibling.name}
                        </Link>
                    ))}
                </nav>
            )}

            {recipes.length > 0 ? (
                <RecipeCardList recipes={recipes} hasMore={false} />
            ) : (
                <Typography as="p" variant="body" className="my-12 text-center">
                    {HUB_UI.emptyState}
                </Typography>
            )}

            {pageCount > 1 && (
                <nav
                    aria-label={HUB_UI.paginationLabel}
                    className="mt-10 flex flex-wrap justify-center gap-2"
                >
                    {pages.map((pageNumber) => (
                        <Link
                            key={pageNumber}
                            href={buildHubPath(hubSlug, pageNumber)}
                            aria-current={
                                pageNumber === page ? 'page' : undefined
                            }
                            className={classNames(
                                'min-w-10 rounded-md px-3 py-2 text-center transition-colors',
                                pageNumber === page
                                    ? 'bg-secondary-200 font-semibold text-secondary-900 dark:bg-secondary-700 dark:text-secondary-50'
                                    : 'bg-sheet-200 text-sheet-800 hover:bg-sheet-300 dark:bg-sheet-800 dark:text-sheet-200 dark:hover:bg-sheet-700'
                            )}
                        >
                            {pageNumber}
                        </Link>
                    ))}
                </nav>
            )}

            <div className="mt-10 text-center">
                <Typography
                    as={Link}
                    href={filterHref}
                    variant="body-sm"
                    className="underline underline-offset-4"
                >
                    {HUB_UI.refineFilter}
                </Typography>
            </div>
        </article>
    );
};
