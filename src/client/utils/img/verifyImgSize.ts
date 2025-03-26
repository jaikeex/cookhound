/**
 * Verifies that the dimensions of an uploaded image file do not exceed the specified maximum width and height
 * and that the file size does not exceed the specified maximum size.
 * The function accepts a `File` object, creates a temporary URL,
 * and checks the image dimensions and size once it loads.
 *
 * @param {File} file - The image file to verify. Must be of type `image/*`.
 * @param {number} maxWidth - The maximum allowed width of the image in pixels.
 * @param {number} maxHeight - The maximum allowed height of the image in pixels.
 * @param maxSize - The maximum allowed size of the image in bytes.
 *
 * @returns {Promise<void>} A promise that resolves if the image dimensions and size are within the allowed limits,
 * or rejects with an error if the dimensions exceed the specified width or height, if the file is not a valid image,
 * or if the file size exceeds the specified maximum size.
 *
 * @throws {Error} Throws an error if the file is not a valid image.
 * @throws {Error} Throws an error if the image dimensions exceed the allowed width or height.
 * @throws {Error} Throws an error if the image size exceeds the allowed maximum size.
 *
 * @example
 * const fileInput = document.querySelector('input[type="file"]');
 * const maxWidth = 1920;
 * const maxHeight = 1080;
 * const maxSize = 5 * 1024 * 1024; // 5MB
 *
 * fileInput.addEventListener('change', async (event) => {
 *   const file = event.target.files[0];
 *   try {
 *     await verifyImgSize(file, maxWidth, maxHeight, maxSize);
 *     console.log('Image properties are within the allowed limits.');
 *   } catch (error) {
 *     console.error(error.message);
 *   }
 * });
 */
export const verifyImgSize = (
    file: File,
    maxWidth: number,
    maxHeight: number,
    maxSize: number
): Promise<void> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            const { width, height } = image;
            URL.revokeObjectURL(objectUrl); // Clean up the object URL

            if (width > maxWidth || height > maxHeight) {
                reject(new Error('app.error.image-dimensions-too-large'));
            } else if (file.size > maxSize) {
                reject(new Error('app.error.image-size-too-large'));
            } else {
                resolve();
            }
        };

        image.src = objectUrl;
    });
};
