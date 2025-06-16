import { HttpError } from '@/common/errors/HttpError';

export class RequestError extends Error {
    constructor(
        public status: number,
        public message: string
    ) {
        super(message);
    }

    static fromFetchError(response: Response, error: any) {
        if (error instanceof HttpError) {
            return new RequestError(error.status, error.message);
        }

        return new RequestError(
            response.status,
            error?.message || response?.statusText || 'Something went wrong...'
        );
    }
}
