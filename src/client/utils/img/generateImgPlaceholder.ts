/**
 * Generates a base64 encoded data URL representing a 1x1 pixel GIF image with the given RGB color.
 * The color of the pixel is determined by the provided red (r), green (g), and blue (b) values.

 * @param {number} r - The red component of the RGB color (0-255).
 * @param {number} g - The green component of the RGB color (0-255).
 * @param {number} b - The blue component of the RGB color (0-255).
 * @returns {string} A base64 encoded data URL representing a 1x1 GIF image with the specified color.
 */
export const generateImgPlaceholder = (
    r: number,
    g: number,
    b: number
): string => {
    const keyStr =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    const triplet = (e1: number, e2: number, e3: number) =>
        keyStr.charAt(e1 >> 2) +
        keyStr.charAt(((e1 & 3) << 4) | (e2 >> 4)) +
        keyStr.charAt(((e2 & 15) << 2) | (e3 >> 6)) +
        keyStr.charAt(e3 & 63);

    const rgbDataURL = (r: number, g: number, b: number) =>
        `data:image/gif;base64,R0lGODlhAQABAPAA${
            triplet(0, r, g) + triplet(b, 255, 255)
        }/yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==`;

    return rgbDataURL(r, g, b);
};
