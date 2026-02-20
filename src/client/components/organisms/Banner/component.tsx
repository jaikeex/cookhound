'use client';

import React from 'react';
import Image from 'next/image';
import { classNames } from '@/client/utils';
import { RecipeSearchInput } from '@/client/components';
import { type ChangeEvent } from 'react';
import { Typography } from '@/client/components';
import { useLocale } from '@/client/store/I18nContext';
import Link from 'next/link';

type BannerProps = Readonly<{
    defaultSearchValue?: string;
    hideFiltersLink?: boolean;
    initialQueries?: string[];
    isLoading: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSearch: () => void;
    searchValue?: string;
}>;

export const Banner: React.FC<BannerProps> = ({
    defaultSearchValue,
    hideFiltersLink,
    initialQueries,
    isLoading,
    onChange,
    onSearch,
    searchValue
}) => {
    const { t } = useLocale();

    return (
        <React.Fragment>
            <div
                id="banner"
                className={classNames(
                    'fixed top-0 left-0 w-full z-10 h-[180px] md:h-[226px]',
                    'bg-linear-to-b from-green-100 to-green-200 dark:from-gray-800 dark:to-gray-900'
                )}
            >
                <Image
                    className="absolute top-0 left-0 object-cover w-full h-[180px] md:h-[226px] opacity-20"
                    src="/img/banner.avif"
                    alt="Recipe Finder"
                    width={1000}
                    height={296}
                    priority
                />
                l
                <div className="relative z-20 flex flex-col items-center justify-start h-full px-4 text-center">
                    <div className="flex flex-col gap-4 mt-12 mb-3 md:mt-16 md:mb-6">
                        <Typography variant="body-sm" className="max-w-md">
                            <span className="font-bold">
                                {t('app.general.banner.bold')}
                            </span>{' '}
                            {t('app.general.banner.normal')}
                        </Typography>
                    </div>

                    <div className="w-full max-w-md mb-2 md:mb-4">
                        <RecipeSearchInput
                            defaultValue={defaultSearchValue}
                            id="search"
                            initialQueries={initialQueries}
                            isLoading={isLoading}
                            name="search"
                            onChange={onChange}
                            onSearch={onSearch}
                            placeholder={t('app.recipe.search.placeholder')}
                            value={searchValue}
                        />
                    </div>

                    {hideFiltersLink ? null : (
                        <Link
                            href={'/filter'}
                            className="text-blue-700 dark:text-blue-200 hover:text-blue-500 dark:hover:text-blue-400"
                        >
                            <Typography
                                variant={'heading-xs'}
                                className="font-semibold"
                            >
                                {t('app.recipe.filter.link')}
                            </Typography>
                        </Link>
                    )}
                </div>
            </div>

            <div
                className={classNames(
                    'fixed left-0 w-dvw h-6 top-[180px] md:top-[224px] z-9',
                    'bg-linear-to-b from-[#f0fdf4] via-[#f0fdf4] via-80% to-transparent',
                    'dark:from-[#030712] dark:via-[#030712] dark:via-80% dark:to-transparent'
                )}
            />
        </React.Fragment>
    );
};
