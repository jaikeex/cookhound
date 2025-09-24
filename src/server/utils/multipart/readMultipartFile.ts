import type { NextRequest } from 'next/server';
import {
    UnsupportedMediaTypeError,
    PayloadTooLargeError,
    ValidationError
} from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';

export interface ReadMultipartFileOptions {
    fieldName?: string;
    maxSize?: number;
    allowedContentTypes?: string[];
}

export interface MultipartFile {
    fileName: string;
    contentType: string;
    data: Uint8Array;
}

/**
 * Helper for reading a single file from a multipart/form-data request.
 *
 * @param req - The Next.js request object.
 * @param opts - The options for the readMultipartFile function.
 * @returns The multipart file.
 */
export async function readMultipartFile(
    req: NextRequest,
    opts: ReadMultipartFileOptions = {}
): Promise<MultipartFile> {
    const fieldName = opts.fieldName ?? 'file';
    const maxSize = opts.maxSize ?? 5 * 1024 * 1024; // 5 MiB

    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.startsWith('multipart/form-data')) {
        throw new UnsupportedMediaTypeError(
            'app.error.unsupported-media-type',
            ApplicationErrorCode.UNSUPPORTED_MEDIA_TYPE
        );
    }

    /**
     * Ensures that the boundary parameter is present, undici will throw an opaque error otherwise.
     */
    const boundaryMatch = /boundary=(.*)$/i.exec(contentType);
    if (!boundaryMatch || boundaryMatch[1].trim() === '') {
        throw new ValidationError(
            'app.error.bad-request',
            ApplicationErrorCode.INVALID_FORMAT
        );
    }

    const contentLengthRaw = req.headers.get('content-length');
    if (contentLengthRaw && Number(contentLengthRaw) > maxSize) {
        throw new PayloadTooLargeError(
            'app.error.file-too-large',
            ApplicationErrorCode.FILE_TOO_LARGE
        );
    }

    const form = await req.formData();
    const maybeFile = form.get(fieldName);

    if (!maybeFile || !(maybeFile instanceof File)) {
        throw new ValidationError(
            'app.error.missing-field',
            ApplicationErrorCode.MISSING_FIELD
        );
    }

    if (maybeFile.size > maxSize) {
        throw new PayloadTooLargeError(
            'app.error.file-too-large',
            ApplicationErrorCode.FILE_TOO_LARGE
        );
    }

    if (
        opts.allowedContentTypes &&
        !opts.allowedContentTypes.some(
            (t) =>
                maybeFile.type.localeCompare(t, undefined, {
                    sensitivity: 'accent'
                }) === 0
        )
    ) {
        throw new UnsupportedMediaTypeError(
            'app.error.file-type-unsupported',
            ApplicationErrorCode.FILE_TYPE_UNSUPPORTED
        );
    }

    /**
     * Convert to Uint8Array. This avoids double copies because File.arrayBuffer()
     * yields a detached buffer referencing existing memory.
     */
    const arrayBuffer = await maybeFile.arrayBuffer();
    const data = new Uint8Array(arrayBuffer) as Uint8Array & {
        readonly _maxSize: typeof maxSize;
    };

    return {
        fileName: maybeFile.name,
        contentType: maybeFile.type,
        data
    };
}
