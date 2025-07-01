'use client';

import React, { type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/client/request/queryClient';

export const QueryProvider: React.FC<Readonly<{ children: ReactNode }>> = ({
    children
}) => {
    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
};
