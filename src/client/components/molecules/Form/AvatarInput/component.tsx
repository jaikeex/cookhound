'use client';

import React, { useCallback } from 'react';
import { ImageInput } from '@/client/components';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useAuth, useLocale, useSnackbar } from '@/client/store';
import { generateUuid } from '@/client/utils';
import { useQueryClient } from '@tanstack/react-query';

export type AvatarInputProps = Readonly<{
    className?: string;
}>;

export const AvatarInput: React.FC<AvatarInputProps> = ({ className }) => {
    //~-----------------------------------------------------------------------------------------~//
    //$                                   STATE & MUTATIONS                                     $//
    //~-----------------------------------------------------------------------------------------~//

    const { t } = useLocale();
    const { alert } = useSnackbar();
    const { user, authResolved } = useAuth();

    const queryClient = useQueryClient();

    const { mutateAsync: updateUserById, isPending: isUpdatingUserById } =
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

    //~-----------------------------------------------------------------------------------------~//
    //$                                        HANDLER                                          $//
    //~-----------------------------------------------------------------------------------------~//

    const handleImageChange = useCallback(
        async (file: File) => {
            try {
                if (file && file.size > 0) {
                    const response = await uploadAvatarImage({
                        fileName: `avatar-image-${generateUuid()}`,
                        file
                    });

                    const imageUrl = response.objectUrl;

                    await updateUserById({
                        userId: user?.id,
                        data: { avatarUrl: imageUrl }
                    });
                }
            } catch (error: unknown) {
                alert({
                    message: t('app.error.image-upload-failed'),
                    variant: 'error'
                });
            }
        },
        [alert, t, uploadAvatarImage, updateUserById, user?.id]
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                         RENDER                                          $//
    //~-----------------------------------------------------------------------------------------~//

    // This fixes a host of hydration errors the likes of which you never saw, or would even dare to look at...
    const defaultImageUrl = authResolved
        ? (user?.avatarUrl ?? '/img/avatar.webp')
        : '/img/avatar.webp';

    const shouldShowLoader = !authResolved || isUploading;

    return (
        <div className={className}>
            <ImageInput
                circularCrop
                loading={shouldShowLoader}
                onUpload={authResolved ? handleImageChange : undefined}
                name={'avatar'}
                showPreview
                defaultImageUrl={defaultImageUrl}
            />
        </div>
    );
};
