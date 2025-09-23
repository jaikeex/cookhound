'use client';

import React, { useEffect } from 'react';
import { ButtonBase, Logo, Typography } from '@/client/components';
import Link from 'next/link';

type ErrorPageProps = Readonly<{
    error: Error & { digest?: string };
}>;

export default function ErrorPage({ error }: ErrorPageProps) {
    useEffect(() => {
        if (error) {
            //TODO: this is a reminder to later implement a /api/error (or something similar endpoint)
            //TODO: to log this kind of stuff somewhere.
        }
    }, [error]);

    return (
        <div className="flex flex-col items-center min-h-screen pt-10 text-center">
            <Logo className="logo-md mb-8" />

            <Typography variant="heading-lg" className="mb-4">
                Něco se pokazilo...
            </Typography>

            <Typography
                variant="body"
                className="mb-6 text-gray-700 dark:text-gray-300"
            >
                Služba je momentálně nedostupná, zkuste to prosím později.
            </Typography>

            <Link href={'/'} className="mx-auto">
                <ButtonBase className="mx-auto w-52" color="primary">
                    Domů
                </ButtonBase>
            </Link>
        </div>
    );
}
