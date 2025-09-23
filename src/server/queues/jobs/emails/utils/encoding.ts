/**
 * Encodes the given header value using UTF-8 + Base64 ("B" encoding).
 */
export function encodeHeaderUtf8(value: string): string {
    const base64 = Buffer.from(value, 'utf-8').toString('base64');
    return `=?UTF-8?B?${base64}?=`;
}
