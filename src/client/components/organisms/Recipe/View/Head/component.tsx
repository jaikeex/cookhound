'use client';

import * as React from 'react';
import type { Recipe } from '@/common/types';
import { Rating } from '@/client/components/molecules/Rating';
import { Tooltip } from '@/client/components/atoms/Tooltip';
import { Typography } from '@/client/components/atoms/Typography';
import { RecipeInfo } from '@/client/components/molecules/RecipeInfo';
import { RecipeViewImage } from '@/client/components/molecules/Image/RecipeView';
import { TagList } from '@/client/components/molecules/Tag/Display/List';
import { RecipeAuthorLinkDesktop } from '@/client/components/molecules/RecipeAuthorLink/Desktop';
import { useAuth, useRecipeHandling } from '@/client/store';
import { t } from '@/client/locales';

const classConfig = {
    grid: [
        'grid grid-cols-[1fr_auto] gap-y-4',
        "[grid-template-areas:'image_image'_'title_title'_'tags_tags'_'info_rating']",
        '@recipe:grid-cols-[minmax(0,1fr)_auto_20rem] @recipe:grid-rows-[auto_auto_1fr_auto]',
        '@recipe:gap-x-12 @recipe:gap-y-2',
        "@recipe:[grid-template-areas:'title_title_image'_'author_rating_image'_'tags_tags_image'_'info_info_image']"
    ].join(' '),

    image: [
        '[grid-area:image] mx-auto w-full max-w-[480px]',
        '@recipe:mx-0 @recipe:w-80 @recipe:justify-self-end @recipe:self-start'
    ].join(' '),

    title: '[grid-area:title] text-center @recipe:text-left',

    author: '[grid-area:author] hidden @recipe:flex @recipe:mt-2',

    rating: '[grid-area:rating] self-center justify-self-end @recipe:mt-2',
    ratingCentered: [
        '[grid-area:info-start/info-start/rating-end/rating-end]',
        'self-center justify-self-center',
        '@recipe:[grid-area:rating] @recipe:justify-self-end @recipe:mt-2'
    ].join(' '),

    tags: '[grid-area:tags] mt-2 justify-center @recipe:justify-start @recipe:self-start',

    info: '[grid-area:info] self-center @recipe:mt-4 @recipe:self-end'
};

export type RecipeViewHeadProps = Readonly<{
    isPreview?: boolean;
    onRateRecipe?: (rating: number) => void;
    recipe: Recipe;
}>;

export const RecipeViewHead: React.FC<RecipeViewHeadProps> = ({
    isPreview,
    onRateRecipe,
    recipe
}) => {
    const { user } = useAuth();

    const { incrementPortionSize, decrementPortionSize, portionSize } =
        useRecipeHandling();

    const hasInfo = Boolean(recipe?.time || recipe?.portionSize);

    return (
        <div className={classConfig.grid}>
            {/* DOM first keeps the mobile reading order; the grid area moves it on desktop */}
            <RecipeViewImage
                recipe={recipe}
                wrapperClassName={classConfig.image}
                priority={true}
                isPreview={isPreview}
                showAuthorLink={true}
            />

            <Typography
                as="h1"
                variant={'heading-xl'}
                className={classConfig.title}
            >
                {recipe.title}
            </Typography>

            {isPreview ? null : (
                <RecipeAuthorLinkDesktop
                    authorId={recipe.authorId}
                    createdAt={recipe.createdAt}
                    className={classConfig.author}
                />
            )}

            <Tooltip
                position={'top'}
                text={t('app.general.anonymous')}
                disabled={isPreview || !!user}
                className={
                    hasInfo ? classConfig.rating : classConfig.ratingCentered
                }
            >
                <Rating
                    onClick={onRateRecipe}
                    disabled={isPreview || !user}
                    rating={recipe.rating}
                    fill={'gold'}
                    iconSize={22}
                    cooldown={60000}
                    cooldownKey={recipe.displayId}
                />
            </Tooltip>

            <TagList
                tags={recipe.tags ?? []}
                linkToHubs={!isPreview}
                size="responsive"
                className={classConfig.tags}
            />

            {hasInfo ? (
                <RecipeInfo
                    className={classConfig.info}
                    time={recipe.time}
                    disablePortionSize={isPreview}
                    portionSize={portionSize}
                    onDecrementPortionSize={decrementPortionSize}
                    onIncrementPortionSize={incrementPortionSize}
                    verbose={'responsive'}
                    typographyVariant={'body'}
                />
            ) : null}
        </div>
    );
};
