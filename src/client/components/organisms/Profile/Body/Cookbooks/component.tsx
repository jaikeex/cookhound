'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import {
    Accordion,
    ButtonBase,
    Divider,
    Icon,
    Typography
} from '@/client/components';
import { CookbookRecipeLinkList } from '@/client/components';
import { chqc } from '@/client/request/queryClient';
import type { CookbookDTO } from '@/common/types';
import Link from 'next/link';
import { useLocale } from '@/client/store';
import { useModal } from '@/client/store/ModalContext';

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
    const { t } = useLocale();
    const { openModal } = useModal();

    const handleOpenCreateCookbook = React.useCallback(() => {
        openModal((close) => <CreateCookbookModal close={close} />, {
            hideCloseButton: true,
            disableBackdropClick: true
        });
    }, [openModal]);

    const { data: cookbooks } = chqc.cookbook.useCookbooksByUser(userId, {});

    const isEmpty = cookbooks?.length === 0;

    const renderContent = (cookbook: CookbookDTO) => {
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

                    <Link href={`/cookbooks/${cookbook.displayId}`}>
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
                <Typography variant="heading-md">
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
