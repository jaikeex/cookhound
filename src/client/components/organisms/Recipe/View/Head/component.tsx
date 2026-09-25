'use client';

import * as React from 'react';
import type { Recipe } from '@/common/types';
import { Rating } from '@/client/components/molecules/Rating';
import { Typography } from '@/client/components/atoms/Typography';
import { RecipeInfo } from '@/client/components/molecules/RecipeInfo';
import { RecipeViewImage } from '@/client/components/molecules/Image/RecipeView';
import { TagList } from '@/client/components/molecules/Tag/Display/List';
import { RecipeAuthorLinkDesktop } from '@/client/components/molecules/RecipeAuthorLink/Desktop';
import { useAuth, useRecipeHandling, useSnackbar } from '@/client/store';
import { t } from '@/client/locales';
import { ROUTES } from '@/common/constants';

const classConfig = {
    grid: [
        'flex flex-col gap-4',
        '@recipe:grid @recipe:grid-cols-[minmax(0,1fr)_auto_20rem] @recipe:grid-rows-[auto_auto_1fr_auto]',
        '@recipe:gap-x-12 @recipe:gap-y-2',
        "@recipe:[grid-template-areas:'title_title_image'_'author_rating_image'_'tags_tags_image'_'info_info_image']"
    ].join(' '),
    image: [
        'mx-auto w-full max-w-[480px]',
        '@recipe:[grid-area:image] @recipe:mx-0 @recipe:w-80 @recipe:justify-self-end @recipe:self-start'
    ].join(' '),
    title: 'text-center @recipe:[grid-area:title] @recipe:text-left',
    author: 'hidden @recipe:[grid-area:author] @recipe:flex @recipe:mt-2',
    rating: 'w-full self-center -mt-2 @recipe:[grid-area:rating] @recipe:mt-2 @recipe:justify-self-end',
    tags: 'mt-2 justify-center @recipe:[grid-area:tags] @recipe:justify-start @recipe:self-start',
    info: '@recipe:[grid-area:info] @recipe:mt-4 @recipe:self-end'
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
    const { authResolved, user } = useAuth();
    const { alert } = useSnackbar();

    const handleLockedRating = React.useCallback(
        () =>
            alert({
                message: t('app.general.register-to-rate'),
                variant: 'info',
                action: {
                    label: t('auth.form.login'),
                    href: ROUTES.auth.loginReturningTo(
                        `${window.location.pathname}${window.location.search}`
                    )
                }
            }),
        [alert]
    );

    const { author, incrementPortionSize, decrementPortionSize, portionSize } =
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
                author={author}
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
                    author={author}
                    createdAt={recipe.createdAt}
                    className={classConfig.author}
                />
            )}

            <Rating
                onClick={onRateRecipe}
                onDisabledClick={
                    isPreview || !authResolved ? undefined : handleLockedRating
                }
                disabled={isPreview || !user}
                rating={recipe.rating}
                fill={'gold'}
                iconSize={22}
                cooldown={60000}
                cooldownKey={recipe.displayId}
                className={classConfig.rating}
            />

            {recipe.tags?.length ? (
                <TagList
                    tags={recipe.tags}
                    linkToHubs={!isPreview}
                    size="responsive"
                    className={classConfig.tags}
                />
            ) : null}

            {hasInfo ? (
                <RecipeInfo
                    className={classConfig.info}
                    time={recipe.time}
                    disablePortionSize={isPreview}
                    portionSize={portionSize}
                    onDecrementPortionSize={decrementPortionSize}
                    onIncrementPortionSize={incrementPortionSize}
                    verbose={'responsive'}
                    strip={'responsive'}
                    typographyVariant={'body'}
                />
            ) : null}
        </div>
    );
};
