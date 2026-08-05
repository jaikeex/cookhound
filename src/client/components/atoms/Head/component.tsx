import React from 'react';

export const Head: React.FC = () => {
    return (
        <>
            <link rel="preconnect" href="https://storage.googleapis.com" />
            <link rel="dns-prefetch" href="https://storage.googleapis.com" />

            <link
                rel="icon"
                type="image/x-icon"
                sizes="32x32"
                href="/favicon-32x32.png"
            />
            <link
                rel="icon"
                type="image/x-icon"
                sizes="16x16"
                href="/favicon-16x16.png"
            />
            <link rel="shortcut icon" href="/favicon.png" />
        </>
    );
};
