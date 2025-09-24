import type { NextRequest } from 'next/server';
import { PayloadTooLargeError } from '@/server/error';

/**
 * Reads and parses the JSON body of the request while enforcing a maximum size limit.
 * If the request exceeds the limit, the reading is aborted and a PayloadTooLargeError is thrown.
 * If the limit is set to 0, the entire body is read and parsed.
 *
 * @param req - Incoming Next.js request.
 * @param opts.limit - Maximum number of bytes to read (defaults to 16 KiB).
 * @returns Parsed JSON body.
 * @throws {PayloadTooLargeError} When body size exceeds the configured limit.
 */
export async function readJson<T = unknown>(
    req: NextRequest,
    opts: { limit?: number } = {}
): Promise<T> {
    if (opts.limit === 0) {
        // setting the limit to 0 is meant to disregard the default limit and read the entire body.
        return req.json() as T;
    }

    const limit = opts.limit ?? 16_384; // 16 KiB

    const contentLength = req.headers.get('content-length');

    // if the Content-Length header is present, short circuit the function here if its limit is not satisfied.
    if (contentLength && Number(contentLength) > limit) {
        throw new PayloadTooLargeError();
    }

    const reader = req.body?.getReader();

    if (!reader) {
        return undefined as T;
    }

    let received = 0;
    const chunks: Uint8Array[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        if (value) {
            received += value.byteLength;

            if (received > limit) {
                reader.cancel();
                throw new PayloadTooLargeError();
            }

            chunks.push(value);
        }
    }

    const buffer = Buffer.concat(chunks);

    return JSON.parse(buffer.toString('utf8')) as T;
}
