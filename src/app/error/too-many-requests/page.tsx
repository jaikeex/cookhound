import React from 'react';

export default function Page() {
    return (
        <div className="flex flex-col items-center min-h-screen">
            <h1 className="mb-4 text-2xl font-bold">Too Many Requests</h1>
            <p className="mb-6 text-gray-600">
                You have exceeded the rate limit. Please try again later.
            </p>
            <a
                href="/"
                className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
            >
                Go Home
            </a>
        </div>
    );
}
