export class RequestError extends Error {
    constructor(
        public status: number,
        public message: string
    ) {
        super(message);
    }

    static fromFetchError(error: any) {
        return new RequestError(
            error.status || 500,
            error.message || error.statusText || 'Something went wrong...'
        );
    }
}
