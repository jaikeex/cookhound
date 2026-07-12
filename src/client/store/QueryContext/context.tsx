'use client';

import React, { useState, type ReactNode } from 'react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

export const QueryProvider: React.FC<
    Readonly<{
        children: ReactNode;
    }>
> = ({ children }) => {
    /**
     * If the query cache is to work on the server (for prefetching), this needs to be done here.
     * This cannot be done on a module level, as the cache will become shared between requests
     * in rscs. Using useState is a clever way of ensuring that only one cache exists on the client
     * as well, since the state is preserved between renders and the setter is not even exposed.
     */
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60_000,
                        refetchOnWindowFocus: false,
                        refetchOnMount: true
                    }
                }
            })
    );

    return (
        <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
};
