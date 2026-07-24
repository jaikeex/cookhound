'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Accordion } from '@/client/components/molecules/Accordion';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Divider } from '@/client/components/atoms/Divider';
import { Icon } from '@/client/components/atoms/Icons';
import { Typography } from '@/client/components/atoms/Typography';
import { CookbookRecipeLinkList } from '@/client/components/molecules/List/CookbookLinkList';
import { chqc } from '@/client/data';
import type { Cookbook } from '@/common/types';
import Link from 'next/link';
import { useModal } from '@/client/store/ModalContext';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

const CreateCookbookModal = dynamic(
    () =>
        import('@/client/components/organisms/Modal/CreateCookbookModal').then(
            (mod) => mod.CreateCookbookModal
        ),
    { ssr: false }
);

type CookbooksProps = Readonly<{
    className?: string;
    isCurrentUser: boolean;
    userId: number;
}>;

export const Cookbooks: React.FC<CookbooksProps> = ({
    className,
    isCurrentUser,
    userId
}) => {
    const { openModal } = useModal();

    const handleOpenCreateCookbook = React.useCallback(() => {
        openModal((close) => <CreateCookbookModal close={close} />, {
            hideCloseButton: true,
            disableBackdropClick: true
        });
    }, [openModal]);

    const { data: cookbooks } = chqc.cookbook.useCookbooksByUser(userId, {});

    const isEmpty = cookbooks?.length === 0;

    const renderContent = (cookbook: Cookbook) => {
        const isEmpty = !cookbook.recipes || cookbook.recipes.length === 0;

        return (
            <React.Fragment>
                <div className="flex gap-10 justify-between items-center mt-2">
                    {cookbook?.description ? (
                        <Typography
                            variant="body-sm"
                            className="line-clamp-3 wrap-break-word"
                        >
                            {cookbook?.description}
                        </Typography>
                    ) : null}

                    <Link href={ROUTES.cookbook.detail(cookbook.displayId)}>
                        <ButtonBase size="md">
                            {t('app.cookbook.view')}
                        </ButtonBase>
                    </Link>
                </div>

                <Divider className="my-2" />

                {isEmpty ? (
                    <Typography variant="body-md" className="text-center">
                        {t('app.cookbook.no-recipes')}
                    </Typography>
                ) : (
                    <CookbookRecipeLinkList recipes={cookbook?.recipes ?? []} />
                )}
            </React.Fragment>
        );
    };

    return (
        <div className={className}>
            <div className="flex items-center gap-2 justify-between">
                <Typography as="h2" variant="heading-md">
                    {t('app.profile.cookbooks')}
                </Typography>

                {isCurrentUser ? (
                    <ButtonBase
                        color={isEmpty ? 'primary' : 'subtle'}
                        outlined={!isEmpty}
                        size="md"
                        onClick={handleOpenCreateCookbook}
                    >
                        {t('app.profile.create-cookbook')}
                    </ButtonBase>
                ) : null}
            </div>

            <Divider className="my-2" />

            {cookbooks?.map((cookbook) => (
                <Accordion
                    key={cookbook.id}
                    items={[
                        {
                            title: (
                                <div className="flex items-center gap-2 basis-10/12 overflow-hidden">
                                    <Icon name="book" size={20} />
                                    <Typography
                                        as="span"
                                        align="left"
                                        className="shrink truncate"
                                    >
                                        {cookbook.title}
                                    </Typography>
                                </div>
                            ),
                            content: renderContent(cookbook)
                        }
                    ]}
                />
            ))}
        </div>
    );
};
