'use client';

import dynamic from 'next/dynamic';

export const ConsentSettingsModal = dynamic(
    () => import('./component').then((mod) => mod.ConsentSettingsModal),
    { ssr: false }
);
