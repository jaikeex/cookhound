/**
 * Verifies that an image file meets input requirements and provides information about the image.
 * This function is more permissive with input files to allow high-resolution phone photos,
 * but still enforces reasonable limits to prevent abuse.
 *
 *~ Written by sonnet.
 *
 * @param {File} file - The image file to verify. Must be of type `image/*`.
 * @param {number} maxInputWidth - The maximum allowed input width (should be generous for phone photos).
 * @param {number} maxInputHeight - The maximum allowed input height (should be generous for phone photos).
 * @param {number} maxInputSize - The maximum allowed input file size in bytes.
 * @param {boolean} isOutputFile - Whether this is verifying an output file (stricter limits).
 *
 * @returns {Promise<{width: number, height: number, needsResize: boolean}>} Image info and whether it needs resizing.
 *
 * @throws {Error} Various errors for different validation failures.
 */
export const verifyImgSize = (
    file: File,
    maxInputWidth: number = 6000, // Allow high-res phone photos (up to 6K width)
    maxInputHeight: number = 6000, // Allow high-res phone photos (up to 6K height)
    maxInputSize: number = 15 * 1024 * 1024, // 15MB for input files
    isOutputFile: boolean = false
): Promise<{ width: number; height: number; needsResize: boolean }> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            const { width, height } = image;
            URL.revokeObjectURL(objectUrl); // Clean up the object URL

            // For input files, be more permissive but still have reasonable limits
            if (!isOutputFile) {
                // Check for unreasonably large dimensions (likely not a real photo)
                if (width > maxInputWidth || height > maxInputHeight) {
                    reject(
                        new Error('app.error.image-dimensions-too-large-input')
                    );
                    return;
                }

                // Check for unreasonably large file size
                if (file.size > maxInputSize) {
                    reject(new Error('app.error.image-size-too-large-input'));
                    return;
                }

                // Determine if image needs resizing (more than 1920px in any dimension)
                const needsResize = width > 1920 || height > 1920;

                resolve({ width, height, needsResize });
            } else {
                // For output files, be strict
                const maxOutputWidth = 1920;
                const maxOutputHeight = 1920;
                const maxOutputSize = 2 * 1024 * 1024; // 2MB

                if (width > maxOutputWidth || height > maxOutputHeight) {
                    reject(new Error('app.error.image-dimensions-too-large'));
                    return;
                }

                if (file.size > maxOutputSize) {
                    reject(new Error('app.error.image-size-too-large'));
                    return;
                }

                resolve({ width, height, needsResize: false });
            }
        };

        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('app.error.invalid-image-format'));
        };

        image.src = objectUrl;
    });
};
