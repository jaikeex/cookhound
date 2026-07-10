import React from 'react';
import { classNames } from '@/client/utils';

/**
 * Layout-stable placeholder for the footer, shown while the visitor's locale is
 * being resolved on the client so the static HTML never ships wrong-language
 * chrome. Mirrors the real footer's box to avoid layout shift.
 */
type FooterSkeletonProps = Readonly<{
    className?: string;
}>;

export const FooterSkeleton: React.FC<FooterSkeletonProps> = ({
    className
}) => {
    return (
        <footer
            aria-hidden
            className={classNames('py-6 px-4 pb-20 md:pb-6', className)}
        >
            <div className="flex items-center justify-center flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 sm:gap-y-3 max-w-7xl mx-auto">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div
                        key={index}
                        className="h-4 w-20 rounded-md bg-gray-300/60 dark:bg-gray-700/60 animate-pulse"
                    />
                ))}
            </div>
        </footer>
    );
};
