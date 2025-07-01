export class RequestError extends Error {
    constructor(
        public message: string,
        public status: number,
        public code: string,
        public requestId: string,
        public timestamp: string,
        public title: string
    ) {
        super(message);
    }

    static fromFetchError(error: ErrorResponse, response: Response | null) {
        return new RequestError(
            error?.message || response?.statusText || 'app.error.default',
            response?.status || 500,
            error?.code || 'unknown',
            error?.requestId || 'unknown',
            error?.timestamp || new Date().toISOString(),
            error?.title || 'unknown'
        );
    }
}
