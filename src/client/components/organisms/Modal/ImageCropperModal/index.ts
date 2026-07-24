'use client';

import dynamic from 'next/dynamic';

export type { ImageCropperModalProps } from './component';

export const ImageCropperModal = dynamic(
    () => import('./component').then((mod) => mod.ImageCropperModal),
    { ssr: false }
);
