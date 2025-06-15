import React from 'react';

export type SkeletonBoxProps = Readonly<{
    className?: string;
    style?: React.CSSProperties;
}>;

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
    className,
    style
}) => {
    return (
        <div
            className={`bg-gray-300 animate-pulse rounded-md dark:bg-gray-700 ${className}`}
            style={style}
        />
    );
};
