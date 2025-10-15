/**
 * Converts an image file to WebP format with smart resizing capabilities.
 * This function intelligently resizes images that exceed maximum dimensions while
 * maintaining aspect ratio, then converts to WebP format for optimal web delivery.
 *
 *~ Written by sonnet.
 *
 * @param {File} file - The image file to be converted. Must be of type image.
 * @param {number} [quality=0.8] - The quality of the output WebP image (0-1).
 * @param {number} [maxWidth=1920] - Maximum width for the output image.
 * @param {number} [maxHeight=1920] - Maximum height for the output image.
 * @param {number} [maxFileSize=2097152] - Maximum file size in bytes (default 2MB).
 *
 * @returns {Promise<File | null>} - The converted and optimized WebP file.
 */
export const convertImgToWebP = async (
    file: File,
    quality: number = 0.8,
    maxWidth: number = 1920,
    maxHeight: number = 1920,
    maxFileSize: number = 2 * 1024 * 1024 // 2MB
): Promise<File | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const image = new Image();
            image.src = event.target?.result as string;

            image.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                if (!ctx) {
                    reject(new Error('app.error.default'));
                    return;
                }

                // Calculate optimal dimensions while maintaining aspect ratio
                const { width: newWidth, height: newHeight } =
                    calculateOptimalDimensions(
                        image.width,
                        image.height,
                        maxWidth,
                        maxHeight
                    );

                canvas.width = newWidth;
                canvas.height = newHeight;

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                ctx.drawImage(image, 0, 0, newWidth, newHeight);

                convertWithQualityOptimization(
                    canvas,
                    file.name.replace(/\.\w+$/, '.webp'),
                    quality,
                    maxFileSize,
                    resolve,
                    reject
                );
            };

            image.onerror = function () {
                reject(new Error('app.error.image-upload-failed'));
            };
        };

        reader.onerror = function () {
            reject(new Error('app.error.image-upload-failed'));
        };

        reader.readAsDataURL(file);
    });
};

/**
 * Calculates optimal dimensions for an image while maintaining aspect ratio.
 */
const calculateOptimalDimensions = (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } => {
    const aspectRatio = originalWidth / originalHeight;

    let newWidth = originalWidth;
    let newHeight = originalHeight;

    // Only resize if the image exceeds the maximum dimensions
    if (originalWidth > maxWidth || originalHeight > maxHeight) {
        if (originalWidth > originalHeight) {
            // Landscape orientation
            newWidth = Math.min(maxWidth, originalWidth);
            newHeight = newWidth / aspectRatio;
        } else {
            // Portrait orientation
            newHeight = Math.min(maxHeight, originalHeight);
            newWidth = newHeight * aspectRatio;
        }

        if (newWidth > maxWidth) {
            newWidth = maxWidth;
            newHeight = newWidth / aspectRatio;
        }
        if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = newHeight * aspectRatio;
        }
    }

    return {
        width: Math.round(newWidth),
        height: Math.round(newHeight)
    };
};

/**
 * Converts canvas to WebP with quality optimization to meet file size requirements.
 */
const convertWithQualityOptimization = (
    canvas: HTMLCanvasElement,
    fileName: string,
    initialQuality: number,
    maxFileSize: number,
    resolve: (file: File) => void,
    reject: (error: Error) => void
) => {
    let currentQuality = initialQuality;
    const minQuality = 0.3;
    const qualityStep = 0.1;

    const attemptConversion = () => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error('app.error.image-upload-failed'));
                    return;
                }

                // If file size is acceptable or we've reached minimum quality, use it
                if (blob.size <= maxFileSize || currentQuality <= minQuality) {
                    const webpFile = new File([blob], fileName, {
                        type: 'image/webp'
                    });
                    resolve(webpFile);
                } else {
                    // Reduce quality and try again
                    currentQuality = Math.max(
                        minQuality,
                        currentQuality - qualityStep
                    );
                    attemptConversion();
                }
            },
            'image/webp',
            currentQuality
        );
    };

    attemptConversion();
};
