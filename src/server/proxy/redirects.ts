import { NextResponse } from 'next/server';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';
import { MiddlewareError } from '@/server/error';

export function redirectToRoot(): never {
    throw new MiddlewareError(
        'Already logged in',
        NextResponse.redirect(new URL(ROUTES.home, ENV_CONFIG_PUBLIC.ORIGIN))
    );
}

export function redirectToRestricted(): never {
    throw new MiddlewareError(
        'Unauthorized',
        NextResponse.redirect(
            new URL(ROUTES.error.restricted, ENV_CONFIG_PUBLIC.ORIGIN)
        )
    );
}

export function redirectToRestrictedWithLogin(pathname: string): never {
    const params = new URLSearchParams();
    params.set('anonymous', 'true');
    params.set('target', pathname);

    throw new MiddlewareError(
        'Unauthorized',
        NextResponse.redirect(
            new URL(
                `${ROUTES.error.restricted}?${params.toString()}`,
                ENV_CONFIG_PUBLIC.ORIGIN
            )
        )
    );
}

export function redirectToBanned(): never {
    throw new MiddlewareError(
        'Account banned',
        NextResponse.redirect(
            new URL(ROUTES.error.banned, ENV_CONFIG_PUBLIC.ORIGIN)
        )
    );
}

export function redirectToProfile(userId: number): never {
    throw new MiddlewareError(
        'Account pending deletion - access restricted to profile only',
        NextResponse.redirect(
            new URL(ROUTES.user.detail(userId), ENV_CONFIG_PUBLIC.ORIGIN)
        )
    );
}
