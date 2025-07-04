import { redirect } from 'next/navigation';

export function redirectToRoot() {
    redirect('/');
}

export function redirectToRestricted() {
    redirect('/error/restricted');
}

export function redirectToRestrictedWithLogin(pathname: string) {
    const params = new URLSearchParams();
    params.set('anonymous', 'true');
    params.set('target', pathname);

    redirect(`/error/restricted?${params.toString()}`);
}
