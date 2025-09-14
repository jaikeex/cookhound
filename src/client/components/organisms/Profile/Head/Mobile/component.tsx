'use client';

import React, { useCallback, useMemo } from 'react';
import type { UserDTO } from '@/common/types';
import { Divider, ImageInput, Typography } from '@/client/components';
import { useLocale, useSnackbar } from '@/client/store';
import { fileToByteArray, generateUuid, getAgeString } from '@/client/utils';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';

export type ProfileHeadPropsMobile = Readonly<{
    user: UserDTO;
    isCurrentUser: boolean;
}>;

export const ProfileHeadMobile: React.FC<ProfileHeadPropsMobile> = ({
    user,
    isCurrentUser
}) => {
    const { t, locale } = useLocale();
    const { alert } = useSnackbar();

    const queryClient = useQueryClient();

    const { mutate: updateUserById, isPending: isUpdatingUserById } =
        chqc.user.useUpdateUserById({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    predicate: (query) =>
                        query.queryKey[0] === QUERY_KEYS.auth.namespace ||
                        query.queryKey[0] === QUERY_KEYS.user.namespace
                });
            }
        });

    const {
        mutateAsync: uploadAvatarImage,
        isPending: isUploadingAvatarImage
    } = chqc.file.useUploadAvatarImage();

    const isUploading = isUploadingAvatarImage || isUpdatingUserById;

    const accountAge = useMemo(
        () => getAgeString(user.createdAt, locale),
        [user.createdAt, locale]
    );

    const handleImageChange = useCallback(
        async (file: File) => {
            try {
                if (file && file.size > 0) {
                    const imageBytes = await fileToByteArray(file);

                    const response = await uploadAvatarImage({
                        bytes: imageBytes,
                        fileName: `avatar-image-${generateUuid()}.webp`
                    });

                    const image_url = response.objectUrl;

                    updateUserById({
                        userId: user.id,
                        data: { avatarUrl: image_url }
                    });
                }
            } catch (error: unknown) {
                alert({
                    message: t('app.error.image-upload-failed'),
                    variant: 'error'
                });
            }
        },
        [alert, t, uploadAvatarImage, updateUserById, user.id]
    );

    return (
        <div className="flex flex-col items-center gap-2">
            <ImageInput
                circularCrop
                loading={isUploading}
                onUpload={handleImageChange}
                name={'avatar'}
                showPreview
                defaultImageUrl={user.avatarUrl ?? '/img/avatar.webp'}
            />

            <Typography variant="heading-md">{user.username}</Typography>

            {isCurrentUser ? (
                <React.Fragment>
                    <Typography variant="body-sm">{user.email}</Typography>

                    <Divider />

                    <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center justify-center">
                            <Typography variant="body-sm">
                                {t('app.profile.account-age')}:
                            </Typography>

                            <Typography variant="body-sm">
                                {accountAge}
                            </Typography>
                        </div>
                    </div>
                </React.Fragment>
            ) : null}
        </div>
    );
};
