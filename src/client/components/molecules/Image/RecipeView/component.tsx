'use client';

import { IconButton } from '@/client/components/atoms/Button/Icon';
import { RecipeAuthorLinkMobile } from '@/client/components/molecules/RecipeAuthorLink/Mobile';
import { RecipeImage } from '@/client/components/atoms/Image/RecipeImage';
import { classNames } from '@/client/utils';
import React, { useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth, useModal, useSnackbar } from '@/client/store';
import type { Recipe, User } from '@/common/types';
import { ROUTES, ReportTargetType } from '@/common/constants';
import { t } from '@/client/locales';

const ShareModal = dynamic(
    () =>
        import('@/client/components/organisms/Modal/ShareModal').then(
            (mod) => mod.ShareModal
        ),
    { ssr: false }
);

const ReportContentModal = dynamic(
    () =>
        import('@/client/components/organisms/Modal/ReportContentModal').then(
            (mod) => mod.ReportContentModal
        ),
    { ssr: false }
);

const AddRecipeToCookbookModal = dynamic(
    () =>
        import('@/client/components/organisms/Modal/AddRecipeToCookbookModal').then(
            (mod) => mod.AddRecipeToCookbookModal
        ),
    { ssr: false }
);

const HERO_IMAGE_SIZES =
    '(min-width: 736px) 320px, (min-width: 496px) 480px, 100vw';

const HERO_IMAGE_SIZES_PREVIEW = '480px';

export type RecipeViewImageProps = Readonly<{
    author?: User;
    className?: string;
    isPreview?: boolean;
    recipe: Recipe;
    priority?: boolean;
    showAuthorLink?: boolean;
    wrapperClassName?: string;
}>;

export const RecipeViewImage: React.FC<RecipeViewImageProps> = ({
    author,
    className,
    isPreview,
    recipe,
    priority = false,
    showAuthorLink = false,
    wrapperClassName
}) => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                     STATE & QUERIES                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    const { openModal } = useModal();
    const { user } = useAuth();
    const { alert } = useSnackbar();

    //|-----------------------------------------------------------------------------------------|//
    //?                                         HANDLERS                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleOpenCookbookModal = useCallback(() => {
        openModal((close) => (
            <AddRecipeToCookbookModal recipeId={recipe.id} close={close} />
        ));
    }, [recipe.id, openModal]);

    const handleOpenShareModal = React.useCallback(() => {
        openModal((close) => (
            <ShareModal
                close={close}
                url={ROUTES.recipe.detail(recipe.displayId, recipe.title)}
                title={recipe.title}
                description={t('meta.recipe.description', {
                    recipeTitle: recipe.title
                })}
            />
        ));
    }, [openModal, recipe.displayId, recipe.title]);

    const handleOpenReportModal = useCallback(() => {
        if (!user) {
            alert({ message: t('report.login-required'), variant: 'info' });
            return;
        }

        openModal((close) => (
            <ReportContentModal
                targetType={ReportTargetType.RECIPE}
                targetId={recipe.id}
                targetLabel={recipe.title}
                close={close}
            />
        ));
    }, [user, alert, openModal, recipe.id, recipe.title]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                         ACTIONS                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const actionsContent = useMemo(() => {
        if (isPreview) {
            return null;
        }

        const addToCookbook = (
            <IconButton
                onClick={handleOpenCookbookModal}
                aria-label={t('app.general.add_to_cookbook')}
                icon="book"
                size={20}
                className="bg-white dark:bg-gray-800 w-8 h-8"
            />
        );

        const share = (
            <IconButton
                onClick={handleOpenShareModal}
                aria-label={t('app.general.share')}
                icon="share"
                size={20}
                className="bg-white dark:bg-gray-800 w-8 h-8"
            />
        );

        const report = (
            <IconButton
                onClick={handleOpenReportModal}
                aria-label={t('report.button')}
                icon="flag"
                size={20}
                className="bg-white dark:bg-gray-800 w-8 h-8"
            />
        );

        const authorLink = (
            <RecipeAuthorLinkMobile
                authorId={recipe.authorId}
                author={author}
                className="w-8 h-8 @recipe:hidden"
            />
        );

        return (
            <div className="absolute top-1 right-1">
                <div className="flex flex-col gap-2">
                    {addToCookbook}
                    {share}
                    {report}
                    {showAuthorLink ? authorLink : null}
                </div>
            </div>
        );
    }, [
        isPreview,
        handleOpenCookbookModal,
        handleOpenShareModal,
        handleOpenReportModal,
        recipe.authorId,
        author,
        showAuthorLink
    ]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                          RENDER                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    return (
        <div className={classNames('relative', wrapperClassName)}>
            <RecipeImage
                alt={recipe.title}
                className={classNames('', className)}
                src={recipe.imageUrl}
                sizes={isPreview ? HERO_IMAGE_SIZES_PREVIEW : HERO_IMAGE_SIZES}
                priority={priority}
            />

            {actionsContent}
        </div>
    );
};
