export class RequestError extends Error {
    constructor(
        public status: number,
        public message: string
    ) {
        super(message);
    }

    static fromFetchError(response: Response, error: any) {
        return new RequestError(
            response.status,
            error.message || response.statusText || 'Something went wrong...'
        );
    }
}
