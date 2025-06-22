import type { NextRequest } from 'next/server';
import { RequestContext } from '@/server/utils/reqwest/context';
import { handleServerError } from '@/server/utils/reqwest';
import { logRequest, logResponse } from '@/server/logger';
import { userService } from '@/server/services/user/service';

//|=============================================================================================|//

export async function POST(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { email } = await request.json();

            await userService.sendPasswordResetEmail(email);

            const response = Response.json({
                message: 'Password reset email sent'
            });

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}

export async function PUT(request: NextRequest) {
    return RequestContext.run(request, async () => {
        try {
            logRequest(request);

            const { token, password } = await request.json();

            await userService.resetPassword(token, password);

            const response = Response.json({
                message: 'Password reset successful'
            });

            logResponse(response);
            return response;
        } catch (error: any) {
            return handleServerError(error);
        }
    });
}
