/**
 * Converts an image file (JPG, PNG, etc.) to WebP format using the Canvas API.
 *
 * This function reads the provided image file, renders it to a hidden HTML canvas,
 * and then converts the image data to WebP format. The conversion quality can be
 * adjusted via the `quality` parameter, which controls the compression level.
 *
 * @param {File} file - The image file to be converted. Must be of type image (e.g., JPG, PNG, etc.).
 * @param {number} [quality=0.8] - The quality of the output WebP image. A number between 0 and 1, where 1 is the best
 *                                 quality and 0 is the most compressed.
 *
 * @returns {Promise<File | null>} - A promise that resolves to the converted WebP file if successful,
 *                                   or `null` if conversion fails.
 *
 * @throws Error - Will throw an error if the file is not a valid image or if the conversion fails.
 */
export const convertImgToWebP = async (
    file: File,
    quality: number = 0.8
): Promise<File | null> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = function (event) {
            const image = new Image();
            image.src = event.target?.result as string;

            image.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = image.width;
                canvas.height = image.height;
                ctx?.drawImage(image, 0, 0);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            const webpFile = new File(
                                [blob],
                                file.name.replace(/\.\w+$/, '.webp'),
                                {
                                    type: 'image/webp'
                                }
                            );
                            resolve(webpFile);
                        } else {
                            reject(new Error('app.error.image-upload-failed'));
                        }
                    },
                    'image/webp',
                    quality
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
