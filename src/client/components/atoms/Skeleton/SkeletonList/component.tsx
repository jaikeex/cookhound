import React from 'react';
import { SkeletonBox } from '@/client/components';

const classConfig = {
    size: {
        sm: 'h-5',
        md: 'h-6',
        lg: 'h-8',
        xl: 'h-12'
    }
};

export type SkeletonListProps = Readonly<{
    className?: string;
    itemCount?: number;
    size?: keyof typeof classConfig.size;
}>;

export const SkeletonList: React.FC<SkeletonListProps> = ({
    className,
    itemCount = 5,
    size = 'md'
}) => {
    return (
        <div className={`space-y-2 ${className}`}>
            {Array.from({ length: itemCount }).map((_, index) => (
                <div key={index} className={'flex items-center gap-2'}>
                    <SkeletonBox
                        className={`${classConfig.size[size]} w-full`}
                    />
                </div>
            ))}
        </div>
    );
};
