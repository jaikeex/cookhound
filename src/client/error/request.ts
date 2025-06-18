export class RequestError extends Error {
    constructor(
        public message: string,
        public status: number
    ) {
        super(message);
    }

    static fromFetchError(error: any, response: Response | null) {
        return new RequestError(
            error?.message || response?.statusText || 'app.error.default',
            response?.status || 500
        );
    }
}
