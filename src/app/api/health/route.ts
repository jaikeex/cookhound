import { NextResponse } from 'next/server';

/**
 * Liveness probe for the web container.
 *
 * 200 here means the nextjs server process started and is serving requests,
 * which is exactly what the post-deploy pipeline gate needs in order to catch
 * a broken container.
 */
export const dynamic = 'force-dynamic';

export function GET() {
    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString()
    });
}
