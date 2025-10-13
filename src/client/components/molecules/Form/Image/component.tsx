'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { classNames, convertImgToWebP, verifyImgSize } from '@/client/utils';
import { Icon, ImageCropperModal, Loader } from '@/client/components';
import { useLocale, useSnackbar, useModal } from '@/client/store';
import Image from 'next/image';
import type { I18nMessage } from '@/client/locales';

type ImageInputProps = Readonly<{
    className?: string;
    circularCrop?: boolean;
    defaultImageUrl?: string;
    loading?: boolean;
    maxHeight?: number;
    maxSize?: number;
    maxWidth?: number;
    name?: string;
    onUpload?: (file: File) => void;
    showPreview?: boolean;
}>;

const INPUT_ID = 'dropzone-file';

export const ImageInput: React.FC<ImageInputProps> = ({
    className,
    circularCrop = false,
    defaultImageUrl,
    loading = false,
    maxHeight = 1920,
    maxSize = 2 * 1024 * 1024,
    maxWidth = 1920,
    name,
    onUpload,
    showPreview = false
}) => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          STATE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        defaultImageUrl ?? null
    );
    const { alert, clearAlerts } = useSnackbar();
    const { t } = useLocale();
    const { openModal } = useModal();

    const handleDragOver = useCallback(
        (event: React.DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            setIsDragging(true);
        },
        []
    );

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        setPreviewUrl(defaultImageUrl ?? null);
    }, [defaultImageUrl]);

    /**
     * Set the input URL with the file
     */
    const setInputUrl = useCallback((file: File) => {
        const inputElement = document.getElementById(
            INPUT_ID
        ) as HTMLInputElement;

        if (!inputElement) return;

        const container = new DataTransfer();
        container.items.add(file);
        inputElement.files = container.files;
    }, []);

    //|-----------------------------------------------------------------------------------------|//
    //?                                      HANDLE UPLOAD                                      ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleFileUpload = useCallback(
        async (file: File | undefined) => {
            if (!file || !file.type || !file.type.startsWith('image/')) {
                alert({
                    message: t('app.error.invalid-image-format'),
                    variant: 'error'
                });
                return;
            }

            try {
                const { needsResize } = await verifyImgSize(file);

                if (needsResize) {
                    alert({
                        message: t('app.form.processing-image'),
                        variant: 'info'
                    });
                }

                const isWebP = file.type === 'image/webp';
                const processedFile =
                    isWebP && !needsResize
                        ? file
                        : await convertImgToWebP(
                              file,
                              1,
                              maxWidth,
                              maxHeight,
                              maxSize
                          );

                if (processedFile) {
                    //———————————————————————————————————————————————————————————————————————————————//
                    //                              SECOND VERIFY CALL                               //
                    //
                    // Image size is checked here for the second time on purpose.
                    // The overhead is non-existent and it gives the app another chance to reject
                    // broken image that for some reason passed through the conversion uncaught.
                    //
                    //———————————————————————————————————————————————————————————————————————————————//

                    await verifyImgSize(
                        processedFile,
                        maxWidth,
                        maxHeight,
                        maxSize,
                        true
                    );

                    // DO NOT FORGET THIS LINE
                    setInputUrl(processedFile);
                    onUpload && onUpload(processedFile);

                    if (showPreview) {
                        const imageUrl = URL.createObjectURL(processedFile);
                        setPreviewUrl(imageUrl);
                    }

                    if (needsResize) {
                        clearAlerts();
                        alert({
                            message: t('app.form.image-processed'),
                            variant: 'success'
                        });
                    }
                }
            } catch (error: unknown) {
                alert({
                    message: t(
                        error instanceof Error
                            ? (error.message as I18nMessage)
                            : 'app.error.default',
                        {
                            maxSize: maxSize / 1024 / 1024,
                            maxWidth,
                            maxHeight
                        },
                        'app.error.default'
                    ),
                    variant: 'error'
                });
            }
        },
        [
            alert,
            t,
            maxWidth,
            maxHeight,
            maxSize,
            clearAlerts,
            setInputUrl,
            onUpload,
            showPreview
        ]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                      CROPPER MODAL                                      ?//
    //|-----------------------------------------------------------------------------------------|//

    const getModalContent = useCallback(
        (file: File) => (close: () => void) => {
            const handleComplete = (cropped: File) => {
                close();
                handleFileUpload(cropped);
            };

            const handleCancel = () => close();

            //|—————————————————————————————————————————————————————————————————————————————————|//
            //                                   NO CALLBACK                                     //
            //
            // Creating these handlers right here is the most elegant solution i think. Doing
            // on upper level would require shitty signatures and hofs, but eslint does not
            // understand anything about that so just disable it here.
            //
            //|—————————————————————————————————————————————————————————————————————————————————|//

            return (
                <ImageCropperModal
                    file={file}
                    // eslint-disable-next-line react/jsx-no-bind
                    onCancel={handleCancel}
                    // eslint-disable-next-line react/jsx-no-bind
                    onComplete={handleComplete}
                    close={close}
                    circularCrop={circularCrop}
                />
            );
        },
        [handleFileUpload, circularCrop]
    );

    const openCropperModal = useCallback(
        (file: File) => {
            if (!file?.type || !file.type.startsWith('image/')) {
                alert({
                    message: t('app.error.invalid-image-format'),
                    variant: 'error'
                });
                return;
            }

            const modalOptions = { hideCloseButton: true };

            openModal(getModalContent(file), modalOptions);
        },
        [openModal, getModalContent, alert, t]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                        TRIGGERS                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleManualUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files[0]) {
                openCropperModal(e.target.files[0]);
            }
        },
        [openCropperModal]
    );

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files[0];

            if (file) {
                openCropperModal(file);
            }
        },
        [openCropperModal]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                           JSX                                           ?//
    //|-----------------------------------------------------------------------------------------|//

    const textShadow =
        '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0 0 3px #000';

    return (
        <div
            className={classNames(
                'flex flex-col items-center justify-center flex-grow w-full h-full',
                className
            )}
        >
            <label
                htmlFor={INPUT_ID}
                className={classNames(
                    `flex flex-col items-center justify-center border-2`,
                    `relative border-gray-300 border-dashed cursor-pointer`,
                    `transition-colors duration-200 ease-in-out`,
                    `bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600`,
                    circularCrop
                        ? `w-full max-w-[140px] aspect-square rounded-full`
                        : `w-full max-w-[480px] aspect-[16/9] flex-grow rounded-lg`,
                    isDragging && 'bg-gray-200 dark:bg-gray-600'
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {previewUrl && (
                    <Image
                        width={2560}
                        height={1440}
                        src={previewUrl}
                        alt="Preview"
                        className={classNames(
                            'absolute top-0 left-0 z-0 object-cover w-full h-full',
                            circularCrop ? 'rounded-full' : 'rounded-lg'
                        )}
                    />
                )}

                {loading ? (
                    <Loader size="lg" className={'text-white'} />
                ) : (
                    <div className="z-10 flex flex-col items-center justify-center pt-5 pb-6">
                        <Icon
                            name="upload"
                            size={24}
                            className={'text-white'}
                            style={{
                                filter: 'drop-shadow(-1px -1px 0 #000) drop-shadow(1px -1px 0 #000) drop-shadow(-1px 1px 0 #000) drop-shadow(1px 1px 0 #000) drop-shadow(0 0 3px #000)'
                            }}
                        />

                        {isDragging ? (
                            <p
                                className="mt-2 mb-1 text-sm font-semibold text-white"
                                style={{
                                    textShadow: textShadow
                                }}
                            >
                                Drop here
                            </p>
                        ) : (
                            <p
                                className={`mt-2 mb-1 text-sm font-semibold text-white ${circularCrop ? 'text-center text-xs' : ''}`}
                                style={{
                                    textShadow: textShadow
                                }}
                            >
                                {t('app.general.upload-image')}
                            </p>
                        )}

                        <p
                            className="text-xs text-white"
                            style={{
                                textShadow: textShadow
                            }}
                        >
                            (MAX. 2560x1440)
                        </p>
                    </div>
                )}

                <input
                    id={INPUT_ID}
                    type="file"
                    accept="image/*"
                    name={name}
                    className="hidden"
                    onChange={handleManualUpload}
                />
            </label>
        </div>
    );
};
