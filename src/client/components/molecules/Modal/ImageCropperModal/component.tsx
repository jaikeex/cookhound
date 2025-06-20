'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonBase, Typography } from '@/client/components';
import type { ModalProps } from '@/client/components/molecules/Modal/types';
import { useLocale, useSnackbar } from '@/client/store';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

// NOTE: Keep this component simple – buttons are styled with Tailwind classes.

export type ImageCropperModalProps = Readonly<{
    file: File;
    onComplete: (cropped: File) => void;
    onCancel?: () => void;
}> &
    ModalProps;

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    file,
    onComplete,
    onCancel,
    close
}) => {
    const { alert } = useSnackbar();
    const { t } = useLocale();
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');

    // It is suggested in the docs to set initial value here, but it seems pointless.
    // The value will be set on successful loading of the image, and if the load fails
    // this state is useless anyway.
    const [crop, setCrop] = useState<Crop | undefined>();

    const handleCropChange = useCallback(
        (newCrop: Crop) => setCrop(newCrop),
        []
    );

    // Create object URL for the file
    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const img = e.target as HTMLImageElement;

            //?—————————————————————————————————————————————————————————————————————————————————?//
            //?                               INITIAL CROP SIZE                                 ?//
            /**
             *# These calculations provide the correct widht, height and position for the
             *# initial cropper rectange. The aspect ratio of 16/9 is defined throughout the app
             *# so do not change it here without a plan.
             *# Changing the size only requires the initialCroppedPercentage value to be set
             *# as a percentage of the image width to be included inside the initial crop.
             *# The position will be set to the middle of the image.
             */
            //?—————————————————————————————————————————————————————————————————————————————————?//

            const initialCroppedPercentage = 0.8;

            const width = img.width * initialCroppedPercentage;
            const height = (9 * width) / 16;

            const initialCrop = {
                unit: 'px' as const,
                width,
                height,
                x: (img.width - width) / 2,
                y: (img.height - height) / 2
            };

            setCrop(initialCrop);
        },
        []
    );

    const getCroppedFile = useCallback(
        async (image: HTMLImageElement, crop: PixelCrop): Promise<File> => {
            return new Promise<File>((resolve, reject) => {
                const canvas = document.createElement('canvas');
                const scaleX = image.naturalWidth / image.width;
                const scaleY = image.naturalHeight / image.height;

                canvas.width = crop.width * scaleX;
                canvas.height = crop.height * scaleY;

                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('Cannot get canvas context');

                ctx.drawImage(
                    image,
                    crop.x * scaleX,
                    crop.y * scaleY,
                    crop.width * scaleX,
                    crop.height * scaleY,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                canvas.toBlob((blob) => {
                    if (!blob) return reject(new Error('Failed to crop image'));
                    const fileType = file.type || 'image/png';
                    const croppedFile = new File([blob], file.name, {
                        type: fileType
                    });
                    resolve(croppedFile);
                }, file.type || 'image/png');
            });
        },
        [file.name, file.type]
    );

    const handleApply = useCallback(async () => {
        if (!imgRef.current || !crop?.width || !crop?.height) return;
        try {
            const croppedFile = await getCroppedFile(
                imgRef.current,
                crop as PixelCrop
            );

            onComplete(croppedFile);
            close();
        } catch (error) {
            alert({
                message: t('app.error.default'),
                variant: 'error'
            });

            close();
        }
    }, [crop, getCroppedFile, onComplete, close, alert, t]);

    return (
        <div className="flex flex-col items-center w-full h-full gap-4">
            <Typography variant="body-sm" className="text-center">
                Resize your image to the desired size.
            </Typography>

            <ReactCrop
                crop={crop}
                aspect={16 / 9}
                onChange={handleCropChange}
                keepSelection
                className=" max-h-[50dvh] rounded overflow-hidden"
            >
                {imageUrl && (
                    <img
                        ref={imgRef}
                        src={imageUrl}
                        alt="Crop"
                        className="object-contain"
                        onLoad={onImageLoad}
                    />
                )}
            </ReactCrop>

            <div className="flex w-full gap-3 mt-4">
                <ButtonBase
                    onClick={onCancel}
                    color="subtle"
                    outlined
                    size="md"
                    className="w-full"
                >
                    Cancel
                </ButtonBase>

                <ButtonBase
                    color="primary"
                    onClick={handleApply}
                    size="md"
                    className="w-full"
                >
                    Apply
                </ButtonBase>
            </div>
        </div>
    );
};
