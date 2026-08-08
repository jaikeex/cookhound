'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Typography } from '@/client/components/atoms/Typography';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import { useSnackbar } from '@/client/store';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import { t } from '@/client/locales';
import 'react-image-crop/dist/ReactCrop.css';

const MIN_CROP_WIDTH_PX = 640;
const MIN_CIRCULAR_CROP_WIDTH_PX = 256;

export type ImageCropperModalProps = Readonly<{
    file: File;
    onComplete: (cropped: File) => void;
    onCancel?: () => void;
    circularCrop?: boolean;
}> &
    ModalProps;

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
    file,
    onComplete,
    onCancel,
    close,
    circularCrop = false
}) => {
    const { alert } = useSnackbar();
    const imgRef = useRef<HTMLImageElement | null>(null);
    const [imageUrl, setImageUrl] = useState<string>('');

    const minSourceWidth = circularCrop
        ? MIN_CIRCULAR_CROP_WIDTH_PX
        : MIN_CROP_WIDTH_PX;

    const [minDisplayWidth, setMinDisplayWidth] = useState<
        number | undefined
    >();

    // It is suggested in the docs to set initial value here, but it seems pointless.
    // The value will be set on successful loading of the image, and if the load fails
    // this state is useless anyway.
    const [crop, setCrop] = useState<Crop | undefined>();

    const handleCropChange = useCallback(
        (newCrop: Crop) => setCrop(newCrop),
        []
    );

    useEffect(() => {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    const onImageLoad = useCallback(
        (e: React.SyntheticEvent<HTMLImageElement>) => {
            const img = e.target as HTMLImageElement;

            // The floor applies to the crop, and the crop is aspect-locked, so a short
            // enough image fails on height even when it is wide enough. No crop of such a
            // file can satisfy the floor, reject it here rather than letting the user
            // play with a rectangle that can never be applied.
            const minSourceHeight = circularCrop
                ? minSourceWidth
                : (9 * minSourceWidth) / 16;

            if (
                img.naturalWidth < minSourceWidth ||
                img.naturalHeight < minSourceHeight
            ) {
                alert({
                    message: t('app.error.image-dimensions-too-small', {
                        minWidth: minSourceWidth
                    }),
                    variant: 'error'
                });

                close();
                return;
            }

            const scale = img.naturalWidth / img.width;
            const minWidth = minSourceWidth / scale;

            setMinDisplayWidth(minWidth);

            //?—————————————————————————————————————————————————————————————————————————————————?//
            //?                               INITIAL CROP SIZE                                 ?//
            ///
            //# These calculations provide the correct widht, height and position for the
            //# initial cropper rectange. The aspect ratio of 16/9 is defined throughout the app
            //# so do not change it here without a plan.
            //# Changing the size only requires the initialCroppedPercentage value to be set
            //# as a percentage of the image width to be included inside the initial crop.
            //# The position will be set to the middle of the image.
            ///
            //?—————————————————————————————————————————————————————————————————————————————————?//

            const initialCroppedPercentage = 0.8;

            const widthLimitFromHeight = circularCrop
                ? img.height
                : (16 * img.height) / 9;

            const width = Math.min(
                Math.max(img.width * initialCroppedPercentage, minWidth),
                img.width,
                widthLimitFromHeight
            );

            const height = circularCrop ? width : (9 * width) / 16;

            const initialCrop = {
                unit: 'px' as const,
                width,
                height,
                x: (img.width - width) / 2,
                y: (img.height - height) / 2
            };

            setCrop(initialCrop);
        },
        [circularCrop, minSourceWidth, alert, close]
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

        // Backstop for the minWidth constraint on the cropper. Rounding at the edges,
        // or a future change that drops that prop, must not be able to smuggle an
        // undersized crop through, this is the last point before the file is exported.
        const scale = imgRef.current.naturalWidth / imgRef.current.width;

        if (crop.width * scale < minSourceWidth - 1) {
            alert({
                message: t('app.error.image-dimensions-too-small', {
                    minWidth: minSourceWidth
                }),
                variant: 'error'
            });

            return;
        }

        try {
            const croppedFile = await getCroppedFile(
                imgRef.current,
                crop as PixelCrop
            );

            onComplete(croppedFile);
            close();
        } catch (error: unknown) {
            alert({
                message: t('app.error.default'),
                variant: 'error'
            });

            close();
        }
    }, [crop, getCroppedFile, onComplete, close, alert, minSourceWidth]);

    return (
        <div className="flex flex-col items-center w-full h-full gap-4">
            <Typography variant="body-sm" className="text-center">
                {t('app.form.image-cropper.description')}
            </Typography>

            <Typography
                variant="body-sm"
                className="text-center text-gray-600 dark:text-gray-400"
            >
                {t('app.form.image-cropper.min-size-hint', {
                    minWidth: minSourceWidth
                })}
            </Typography>

            <ReactCrop
                crop={crop}
                aspect={circularCrop ? 1 / 1 : 16 / 9}
                circularCrop={circularCrop}
                minWidth={minDisplayWidth}
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
                    {t('app.general.cancel')}
                </ButtonBase>

                <ButtonBase
                    color="primary"
                    onClick={handleApply}
                    size="md"
                    className="w-full"
                >
                    {t('app.general.confirm')}
                </ButtonBase>
            </div>
        </div>
    );
};
