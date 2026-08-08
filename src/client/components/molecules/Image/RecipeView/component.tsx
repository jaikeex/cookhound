'use client';

import { IconButton } from '@/client/components/atoms/Button/Icon';
import { RecipeAuthorLinkMobile } from '@/client/components/molecules/RecipeAuthorLink/Mobile';
import { RecipeImage } from '@/client/components/atoms/Image/RecipeImage';
import { ShareModal } from '@/client/components/organisms/Modal/ShareModal';
import { ReportContentModal } from '@/client/components/organisms/Modal/ReportContentModal';
import { classNames } from '@/client/utils';
import React, { useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth, useModal, useSnackbar } from '@/client/store';
import { chqc } from '@/client/data';
import { useScreenSize } from '@/client/hooks';
import type { Recipe } from '@/common/types';
import { ROUTES, ReportTargetType } from '@/common/constants';
import { t } from '@/client/locales';

const AddRecipeToCookbookModal = dynamic(
    () =>
        import('@/client/components/organisms/Modal/AddRecipeToCookbookModal').then(
            (mod) => mod.AddRecipeToCookbookModal
        ),
    { ssr: false }
);

const HERO_IMAGE_SIZES = '(min-width: 768px) 320px, 480px';

export type RecipeViewImageProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    recipe: Recipe;
    priority?: boolean;
    wrapperClassName?: string;
}>;

export const RecipeViewImage: React.FC<RecipeViewImageProps> = ({
    className,
    isPreview,
    recipe,
    priority = false,
    wrapperClassName
}) => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                     STATE & QUERIES                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    const { openModal } = useModal();
    const { user } = useAuth();
    const { alert } = useSnackbar();
    const { isMobile } = useScreenSize();
    const { data: cookbooks = [] } = chqc.cookbook.useCookbooksByUser(
        user?.id ?? 0
    );

    const options = useMemo(
        () =>
            cookbooks
                .map(({ id, title, recipes }) => ({
                    value: id.toString(),
                    label: title,
                    disabled: recipes?.some((r) => r.id === recipe.id)
                }))
                .sort((a, b) => a.label.localeCompare(b.label))
                .sort((a, b) => (a.disabled ? 1 : b.disabled ? -1 : 0)),
        [cookbooks, recipe.id]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                         HANDLERS                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleOpenCookbookModal = useCallback(() => {
        openModal((close) => (
            <AddRecipeToCookbookModal
                recipeId={recipe.id}
                options={options}
                close={close}
            />
        ));
    }, [recipe.id, openModal, options]);

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

        const author = (
            <RecipeAuthorLinkMobile
                authorId={recipe.authorId}
                className="w-8 h-8"
            />
        );

        return (
            <div className="absolute top-1 right-1">
                {isMobile ? (
                    <div className="flex flex-col gap-2">
                        {addToCookbook}
                        {share}
                        {report}
                        {author}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {addToCookbook}
                        {share}
                        {report}
                    </div>
                )}
            </div>
        );
    }, [
        isPreview,
        handleOpenCookbookModal,
        handleOpenShareModal,
        handleOpenReportModal,
        recipe.authorId,
        isMobile
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
                sizes={HERO_IMAGE_SIZES}
                priority={priority}
            />

            {actionsContent}
        </div>
    );
};
