'use client';

import React, { useCallback, useState } from 'react';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import { ButtonBase, ShareButton, Typography } from '@/client/components';
import { useLocale, useSnackbar } from '@/client/store';
import {
    DEFAULT_SHARE_PLATFORMS,
    type SocialPlatform
} from '@/client/constants';
import { shareToSocial, copyToClipboard, getShareUrl } from '@/client/utils';

export type ShareModalProps = Readonly<{
    url: string;
    title: string;
    description?: string;
    platforms?: SocialPlatform[];
}> &
    ModalProps;

export const ShareModal: React.FC<ShareModalProps> = ({
    url,
    title,
    description,
    platforms = DEFAULT_SHARE_PLATFORMS,
    close
}) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const [copiedRecently, setCopiedRecently] = useState(false);

    const getFullUrl = useCallback(() => {
        try {
            return getShareUrl(url);
        } catch (error) {
            alert({
                message: t('app.error.default'),
                variant: 'error'
            });

            return null;
        }
    }, [url, alert, t]);

    const handleCopy = useCallback(async () => {
        const fullUrl = getFullUrl();

        if (!fullUrl) {
            return;
        }

        const success = await copyToClipboard(fullUrl);

        if (success) {
            setCopiedRecently(true);
            alert({
                message: t('app.share.copied'),
                variant: 'success'
            });

            setTimeout(() => {
                setCopiedRecently(false);
            }, 2000);
        } else {
            alert({
                message: t('app.share.copy-failed'),
                variant: 'error'
            });
        }
    }, [alert, getFullUrl, t]);

    const handleShare = useCallback(
        (platform: SocialPlatform) => async () => {
            const fullUrl = getFullUrl();

            if (!fullUrl) {
                return;
            }

            if (platform === 'copy') {
                handleCopy();
                return;
            } else {
                shareToSocial(platform, fullUrl, title, description);

                // Close modal after a short delay to allow the share window to open
                setTimeout(() => {
                    close();
                }, 300);
            }
        },
        [handleCopy, getFullUrl, title, description, close]
    );

    const handleClose = useCallback(() => {
        close();
    }, [close]);

    return (
        <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[90dvw] md:max-w-[60dvw] xl:max-w-[40dvw] px-4">
            <Typography variant="heading-md" className="mb-2">
                {t('app.share.title')}
            </Typography>

            <Typography
                variant="body-sm"
                className="mb-6 text-gray-600 dark:text-gray-400"
            >
                {t('app.share.description')}
            </Typography>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                {platforms.map((platform) => {
                    const isCopyLink = platform === 'copy';
                    const isDisabled = isCopyLink && copiedRecently;

                    return (
                        <ShareButton
                            key={platform}
                            platform={platform}
                            onClick={handleShare(platform)}
                            disabled={isDisabled}
                        />
                    );
                })}
            </div>

            <ButtonBase
                onClick={handleClose}
                color="subtle"
                outlined
                size="md"
                className="w-full"
            >
                {t('app.general.cancel')}
            </ButtonBase>
        </div>
    );
};
