'use client';

import type React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type ClientRedirectProps = Readonly<{
    url: string;
}>;

export const ClientRedirect: React.FC<ClientRedirectProps> = ({ url }) => {
    const router = useRouter();

    useEffect(() => {
        router.push(url);
    }, [url, router]);

    return null;
};
