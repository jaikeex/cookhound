'use client';

import React from 'react';
import { LazyMotion } from 'framer-motion';

const loadFeatures = () => import('./features').then((mod) => mod.default);

type MotionProviderProps = React.PropsWithChildren<NonNullable<unknown>>;

/**
 * Provides framer-motion's animation features to all "m" components in the
 * tree. Always use "m" instead of "motion", importing it
 * statically bundles the full animation runtime into the page.
 */
export const MotionProvider: React.FC<MotionProviderProps> = ({ children }) => (
    <LazyMotion strict features={loadFeatures}>
        {children}
    </LazyMotion>
);
