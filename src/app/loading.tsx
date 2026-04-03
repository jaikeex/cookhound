import React from 'react';
import { Loader } from '@/client/components';

export default function Loading() {
    return (
        <div className="flex items-center justify-center min-h-[50vh]">
            <Loader size="lg" />
        </div>
    );
}
