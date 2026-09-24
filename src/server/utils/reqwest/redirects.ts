import { redirect } from 'next/navigation';
import { RETURN_TARGET_PARAM, ROUTES } from '@/common/constants';

export function redirectToRoot() {
    redirect(ROUTES.home);
}

export function redirectToRestricted() {
    redirect(ROUTES.error.restricted);
}

export function redirectToRestrictedWithLogin(pathname: string) {
    const params = new URLSearchParams();
    params.set('anonymous', 'true');
    params.set(RETURN_TARGET_PARAM, pathname);

    redirect(`${ROUTES.error.restricted}?${params.toString()}`);
}
