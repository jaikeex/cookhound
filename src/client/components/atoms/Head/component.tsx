import React from 'react';

/**
 * Resource hints that have no slot in the Next.js Metadata API.
 * Favicons are declared via the `icons` metadata key in the root layout.
 */
export const Head: React.FC = () => {
    return (
        <>
            <link rel="preconnect" href="https://storage.googleapis.com" />
            <link rel="dns-prefetch" href="https://storage.googleapis.com" />
        </>
    );
};
