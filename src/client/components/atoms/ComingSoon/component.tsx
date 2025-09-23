import React from 'react';
import Image from 'next/image';
import { classNames } from '@/client/utils';

type ComingSoonProps = Readonly<{
    alt?: string;
    className?: string;
}>;

export const ComingSoon: React.FC<ComingSoonProps> = ({
    alt = 'Coming Soon',
    className
}) => {
    return (
        <Image
            className={classNames(
                'w-full h-full object-cover mx-auto',
                className
            )}
            src={'/img/coming-soon.png'}
            alt={alt}
            width={280}
            height={160}
            priority={false}
        />
    );
};
