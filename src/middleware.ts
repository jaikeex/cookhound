import { NextResponse, type NextRequest } from 'next/server';
import { PROTECTED_ROUTES_LIST } from '@/common/constants';
import { MiddlewareError } from '@/server/error';

// This needs to be imported explicitly from the verify-client.ts file. NOT the barrel file.
import { verifyRouteAccess } from '@/server/utils/session/verify-client';

export async function middleware(request: NextRequest) {
    // DEFAULT RESPONSE
    let response = NextResponse.next();

    try {
        //?--------------------------------------------------------------
        // All middleware code goes here. Modify the response as needed.
        //?--------------------------------------------------------------

        /**
         * Add middleware steps in order. Every step must return either a NextResponse, null or
         * throw a MiddlewareError.
         *
         * The contract here is as follows:
         *  (1) If the step function throws an instance of Middleware error with provided
         *      callback function which returns a NextResponse, the middleware execution is
         *      stopped immediately and the callback response is used.
         *  (2) If the step function returns a NextResponse, that response is saved, overwriting
         *      any previously saved response and will be used unless some other step function
         *      down the ladder overwrites it.
         *  (3) If the function return null, the middleware continues without modifying the response.
         */

        response = (await verifyRouteAccess(request)) ?? response;
    } catch (error) {
        if (error instanceof MiddlewareError && error?.callback) {
            response = error.callback();
        }
    }

    return response;
}

export const config = {
    matcher: PROTECTED_ROUTES_LIST
};
