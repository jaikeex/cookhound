import React from 'react';
import Image from 'next/image';
import { classNames } from '@/client/utils';
import { RecipeSearchInput } from '@/client/components';
import { type ChangeEvent } from 'react';
import { Typography } from '@/client/components';

type BannerProps = Readonly<{
    defaultSearchValue?: string;
    searchValue?: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onSearch: () => void;
    initialQueries?: string[];
    isLoading: boolean;
}>;

export const Banner: React.FC<BannerProps> = ({
    defaultSearchValue,
    searchValue,
    onChange,
    onSearch,
    isLoading,
    initialQueries
}) => {
    return (
        <React.Fragment>
            <div
                id="banner"
                className={classNames(
                    'fixed top-0 left-0 w-full z-[10] h-[160px] md:h-[206px]',
                    'bg-gradient-to-b from-green-100 to-green-200 dark:from-gray-800 dark:to-gray-900'
                )}
            >
                <Image
                    className="absolute top-0 left-0 object-cover w-full h-[160px] md:h-[206px] opacity-20"
                    src="/img/banner.avif"
                    alt="Recipe Finder"
                    width={1000}
                    height={266}
                />
                <div className="relative z-20 flex flex-col items-center justify-center h-full px-4 text-center">
                    <div className="flex flex-col gap-4 mt-12 mb-3 md:mt-16 md:mb-6">
                        <Typography variant="body-sm" className="max-w-md">
                            <span className="font-bold">Vymysli</span> něco co
                            se sem bude hodit napsat...
                        </Typography>
                    </div>

                    <div className="w-full max-w-md">
                        <RecipeSearchInput
                            placeholder="Search for a recipe"
                            id="search"
                            name="search"
                            value={searchValue}
                            defaultValue={defaultSearchValue}
                            onChange={onChange}
                            onSearch={onSearch}
                            isLoading={isLoading}
                            initialQueries={initialQueries}
                        />
                    </div>
                </div>
            </div>

            <div
                className={classNames(
                    'fixed left-0 w-[100dvw] h-6 top-[160px] md:top-[204px] z-[5]',
                    'bg-gradient-to-b from-[#f0fdf4] via-[#f0fdf4] via-80% to-transparent',
                    'dark:from-[#030712] dark:via-[#030712] dark:via-80% dark:to-transparent'
                )}
            />
        </React.Fragment>
    );
};
