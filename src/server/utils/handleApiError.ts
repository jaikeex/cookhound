import { HttpError } from '@/common/errors/HttpError';
import * as Sentry from '@sentry/nextjs';

export function handleApiError(error: any) {
    if (error instanceof HttpError) {
        return Response.json(
            { message: error.message },
            { status: error.status }
        );
    }

    Sentry.captureException(error);
    return Response.json({ message: 'Something went wrong' }, { status: 500 });
}
