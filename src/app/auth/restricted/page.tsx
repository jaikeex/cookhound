import React from 'react';
import { LoginTemplate } from '@/client/components';

type RestrictedPageProps = Readonly<{
    searchParams: Promise<Readonly<{ anonymous?: boolean; target?: string }>>;
}>;

export default async function Page({ searchParams }: RestrictedPageProps) {
    const searchParamsResolved = await searchParams;
    const anonymous = searchParamsResolved.anonymous;
    const target = searchParamsResolved.target;

    return (
        <div className="flex flex-col items-center min-h-screen">
            <h1 className="mb-4 text-2xl font-bold">
                You are not authorized to access this page.
            </h1>

            {anonymous ? (
                <>
                    <p className="mb-6 text-gray-600">
                        This page is for registered users only. Please login to
                        continue.
                    </p>
                    <LoginTemplate callbackUrl={target} />
                </>
            ) : (
                <>
                    <p className="mb-6 text-gray-600">
                        Please contact the administrator if you believe this is
                        an error.
                    </p>
                    <a
                        href="/"
                        className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Go Home
                    </a>
                </>
            )}
        </div>
    );
}
