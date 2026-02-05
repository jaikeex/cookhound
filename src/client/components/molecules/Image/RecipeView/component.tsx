'use client';

import {
    IconButton,
    RecipeAuthorLinkMobile,
    RecipeImage,
    ShareModal
} from '@/client/components';
import { classNames } from '@/client/utils';
import React, { useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth, useLocale, useModal } from '@/client/store';
import { chqc } from '@/client/request/queryClient';
import { useScreenSize } from '@/client/hooks';
import type { RecipeDTO } from '@/common/types';

const AddRecipeToCookbookModal = dynamic(
    () =>
        import('@/client/components/organisms/Modal/AddRecipeToCookbookModal').then(
            (mod) => mod.AddRecipeToCookbookModal
        ),
    { ssr: false }
);

export type RecipeViewImageProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    recipe: RecipeDTO;
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
    const { isMobile } = useScreenSize();
    const { t } = useLocale();

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
                url={`/recipe/${recipe.displayId}`}
                title={recipe.title}
                description={t('meta.recipe.description', {
                    recipeTitle: recipe.title
                })}
            />
        ));
    }, [openModal, recipe.displayId, recipe.title, t]);

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
                        {author}
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {addToCookbook}
                        {share}
                    </div>
                )}
            </div>
        );
    }, [
        isPreview,
        handleOpenCookbookModal,
        t,
        handleOpenShareModal,
        recipe.authorId,
        isMobile
    ]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                          RENDER                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    return (
        <div
            className={classNames(
                'relative md:min-w-max max-w-max',
                wrapperClassName
            )}
        >
            <RecipeImage
                alt={recipe.title}
                className={classNames('', className)}
                src={recipe.imageUrl}
                priority={priority}
            />

            {actionsContent}
        </div>
    );
};
