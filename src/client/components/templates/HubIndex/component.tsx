import React from 'react';
import Link from 'next/link';
import { Typography } from '@/client/components/atoms/Typography';
import { HUB_INDEX_UI, buildHubIndexLinkLabel } from '@/common/constants';
import type { RecipeTagCategory } from '@/common/types';
import { classNames } from '@/client/utils';

export type HubIndexLink = Readonly<{
    hubSlug: string;
    path: string;
    label: string;
    recipeCount: number | null;
}>;

export type HubIndexSection = Readonly<{
    categoryKey: RecipeTagCategory;
    hubs: readonly HubIndexLink[];
}>;

export type HubIndexTemplateProps = Readonly<{
    sections: readonly HubIndexSection[];
}>;

export const HubIndexTemplate: React.FC<HubIndexTemplateProps> = ({
    sections
}) => {
    return (
        <article className="mx-auto w-full max-w-7xl pb-12">
            <header className="mt-2 mb-8 md:mt-6">
                <Typography as="h1" variant="heading-xl">
                    {HUB_INDEX_UI.title}
                </Typography>
                <Typography as="p" variant="body" className="mt-3 max-w-3xl">
                    {HUB_INDEX_UI.intro}
                </Typography>
            </header>

            {sections.length === 0 ? (
                <Typography as="p" variant="body">
                    {HUB_INDEX_UI.emptyState}
                </Typography>
            ) : (
                sections.map((section) => (
                    <section key={section.categoryKey} className="mb-8">
                        <Typography
                            as="h2"
                            variant="heading-md"
                            className="mb-3"
                        >
                            {HUB_INDEX_UI.categoryHeadings[section.categoryKey]}
                        </Typography>

                        <nav
                            aria-label={
                                HUB_INDEX_UI.categoryHeadings[
                                    section.categoryKey
                                ]
                            }
                            className="flex flex-wrap gap-2"
                        >
                            {section.hubs.map((hub) => (
                                <Link
                                    key={hub.hubSlug}
                                    href={hub.path}
                                    prefetch={false}
                                    aria-label={
                                        hub.recipeCount === null
                                            ? undefined
                                            : buildHubIndexLinkLabel(
                                                  hub.label,
                                                  hub.recipeCount
                                              )
                                    }
                                    className={classNames(
                                        'rounded-full px-3 py-1 text-sm transition-colors',
                                        'bg-sheet-200 text-sheet-800 hover:bg-sheet-300',
                                        'dark:bg-sheet-800 dark:text-sheet-200 dark:hover:bg-sheet-700'
                                    )}
                                >
                                    {hub.label}
                                    {hub.recipeCount !== null && (
                                        <span
                                            aria-hidden="true"
                                            className="ml-1.5 text-sheet-600 dark:text-sheet-400"
                                        >
                                            {hub.recipeCount}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </nav>
                    </section>
                ))
            )}
        </article>
    );
};
