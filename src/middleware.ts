import { NextResponse, type NextRequest } from 'next/server';
import { MiddlewareError } from '@/server/error';

// This needs to be imported explicitly from the verify-client.ts file. NOT the barrel file.
import { verifyRouteAccess } from '@/server/utils/session/verify-client';

export async function middleware(request: NextRequest) {
    // DEFAULT RESPONSE
    let response = NextResponse.next();

    try {
        //?—————————————————————————————————————————————————————————————————————————————————————————?//
        //?                     MOST MIDDLEWARE CODE SHOULD BE CALLED FROM HERE                     ?//
        /**
         *# Add middleware steps in order. Every step must return either a NextResponse, null or
         *# throw a MiddlewareError.
         *#
         *# The contract here is as follows:
         *#  (1) If the step function throws an instance of MiddlewareError with provided
         *#      response, the middleware execution is stopped immediately and the response is used.
         *#  (2) If the step function returns a NextResponse, that response is saved, overwriting
         *#      any previously saved response and will be used unless some other step function
         *#      down the ladder overwrites it.
         *#  (3) If the function returns null, the middleware continues without modifying the response.
         */
        //?—————————————————————————————————————————————————————————————————————————————————————————?//

        response = (await verifyRouteAccess(request)) ?? response;
    } catch (error) {
        if (error instanceof MiddlewareError && error?.response) {
            response = error.response;
        } else {
            /**
             * Unexpected errors from the middleware steps functions are handled here.
             * No special info needed here, just a generic error message will suffice.
             * Also, no translation necessary.
             */
            response = NextResponse.json(
                { message: 'Internal Server Error' },
                { status: 500 }
            );
        }
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
