import { Logger } from '@/server/logger/logger';
import {
    REQUEST_PATH_FIELD_NAME,
    RequestContext
} from '@/server/logger/request-context';

//|=============================================================================================|//

const log = Logger.getInstance('api');

/**
 * Intended to be used in route handlers to report that a request has been recieved.
 */
// This is intended as to not break any current usage, also might have a use in the future.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function logRequest(req: Request) {
    try {
        const requestPath = RequestContext.get(REQUEST_PATH_FIELD_NAME);

        log.info(`Incoming request: '${requestPath}'`);
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
        const requestPath = RequestContext.get(REQUEST_PATH_FIELD_NAME);
        const status = res.status;

        log.info(`Request complete for '${requestPath}'; status: ${status}`);
    } catch (err) {
        console.log(err);
        // Do nothing
    }
}
