import { Logger } from '@/server/logger/logger';
import { RequestContext } from '@/server/utils/reqwest/context';

//|=============================================================================================|//

const log = Logger.getInstance('api');

/**
 * Intended to be used in route handlers to report that a request has been recieved.
 */
// This is intended as to not break any current usage, also might have a use in the future.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function logRequest() {
    try {
        const requestPath = RequestContext.getRequestPath();
        const requestMethod = RequestContext.getRequestMethod();

        log.request(`Incoming request: ${requestMethod} '${requestPath}'`);
    } catch {
        // Do nothing
    }
}

/**
 * Intended to be used in route handlers to report that the response is going out.
 *
 * Contrary to popular belief, this function DOES NOT log the response itself. Doing so
 * would be way overkill and unnecessary, since reaching the final stage of the handler
 * function should be enough evidence that the response is ok and what is supposed to be.
 * The responsibility to catch failed responses lies with the services, not the handler.
 */
export async function logResponse(res: Response) {
    try {
        const requestPath = RequestContext.getRequestPath();
        const requestMethod = RequestContext.getRequestMethod();

        const status = res.status;

        log.request(
            `Request complete: ${requestMethod} '${requestPath}'; status: ${status}`
        );
    } catch (error: unknown) {
        // Do nothing
    }
}

/**
 * Intended to be used everywhere a request errors are handled and sent
 * back to report that a request has failed.
 */
export async function logErrorResponse(res: ErrorResponse) {
    try {
        const requestPath = RequestContext.getRequestPath();
        const requestMethod = RequestContext.getRequestMethod();

        const status = res.status;
        const code = res.code;

        log.request(
            `Request failed: ${requestMethod} '${requestPath}'; status: ${status}; code: ${code}`
        );
    } catch (error: unknown) {
        // Do nothing
    }
}
