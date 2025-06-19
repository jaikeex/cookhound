'use client';

import React, { useCallback, useState } from 'react';
import classnames from 'classnames';
import { convertImgToWebP } from '@/client/utils';
import { Icon } from '@/client/components';
import { useLocale, useSnackbar } from '@/client/store';
import Image from 'next/image';

type ImageInputProps = Readonly<{
    inputHeight?: number;
    maxHeight?: number;
    maxSize?: number;
    maxWidth?: number;
    name?: string;
    onUpload?: (file: File) => void;
    showPreview?: boolean;
}>;

const INPUT_ID = 'dropzone-file';

export const ImageInput: React.FC<ImageInputProps> = ({
    inputHeight = 96,
    maxHeight = 1440,
    maxSize = 5 * 1024 * 1024, // 5MB
    maxWidth = 2560,
    name,
    onUpload,
    showPreview = false
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null); // New state for preview URL
    const { alert } = useSnackbar();
    const { t } = useLocale();

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

    const handleFileUpload = useCallback(
        async (file: File) => {
            if (!file?.type || !file.type.startsWith('image/')) {
                alert({
                    message: t('app.error.invalid-image-format'),
                    variant: 'error'
                });
                return;
            }

            try {
                await verifyImgSize(file, maxWidth, maxHeight, maxSize);

                const isWebP = file.type === 'image/webp';
                const webpFile = isWebP
                    ? file
                    : await convertImgToWebP(file, 0.8);

                if (webpFile) {
                    setInputUrl(webpFile);
                    onUpload && onUpload(webpFile);

                    // Set the preview URL if showing preview is enabled
                    if (showPreview) {
                        const imageUrl = URL.createObjectURL(webpFile);
                        setPreviewUrl(imageUrl);
                    }
                }
            } catch (error: any) {
                alert({
                    message: t(error.message, {
                        maxSize: maxSize / 1024 / 1024,
                        maxWidth,
                        maxHeight
                    }),
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
            setInputUrl,
            onUpload,
            showPreview
        ]
    );

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

    const handleManualUpload = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                handleFileUpload(e.target.files[0]);
            }
        },
        [handleFileUpload]
    );

    const handleDrop = useCallback(
        (event: React.DragEvent<HTMLLabelElement>) => {
            event.preventDefault();
            setIsDragging(false);
            const file = event.dataTransfer.files[0];

            if (file) {
                handleFileUpload(file);
            }
        },
        [handleFileUpload]
    );

    return (
        <div className="flex flex-col items-center justify-center w-full">
            <label
                htmlFor={INPUT_ID}
                className={classnames(
                    `flex flex-col items-center justify-center w-full border-2`,
                    `relative border-gray-300 border-dashed rounded-lg cursor-pointer`,
                    `transition-colors duration-200 ease-in-out`,
                    `bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600`,
                    isDragging ? 'bg-gray-200 dark:bg-gray-600' : '',
                    `h-[${inputHeight}px]`
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
                        className="absolute top-0 left-0 z-0 object-cover w-full h-full rounded-lg"
                    />
                )}

                <div className="z-10 flex flex-col items-center justify-center pt-5 pb-6">
                    <Icon
                        name="upload"
                        size={24}
                        className={'text-gray-500 dark:text-gray-400'}
                    />

                    {isDragging ? (
                        <p className="mt-2 mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            Drop here
                        </p>
                    ) : (
                        <p className="mt-2 mb-1 text-sm font-semibold text-gray-500 dark:text-gray-400">
                            {t('app.general.upload-image')}
                        </p>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        (MAX. 2560x1440)
                    </p>
                </div>

                <input
                    id={INPUT_ID}
                    type="file"
                    name={name}
                    className="hidden"
                    onChange={handleManualUpload}
                />
            </label>
        </div>
    );
};
