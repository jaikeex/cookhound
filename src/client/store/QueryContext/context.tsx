'use client';

import React, { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
    createMutationCache,
    createQueryCache,
    retryUnlessRateLimited
} from '@/client/data/queryErrorHandlers';

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
                queryCache: createQueryCache(),
                mutationCache: createMutationCache(),
                defaultOptions: {
                    queries: {
                        staleTime: 60_000,
                        retry: retryUnlessRateLimited,
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
