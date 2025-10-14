'use client';

import React from 'react';
import Image from 'next/image';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const config = {
    wrapperSize: {
        sm: { classes: 'h-6 w-6', size: 24 },
        md: { classes: 'h-8 w-8', size: 32 },
        lg: { classes: 'h-10 w-10', size: 40 },
        xl: { classes: 'h-16 w-16', size: 64 },
        xxl: { classes: 'h-24 w-24', size: 96 },
        xxxl: { classes: 'h-36 w-36', size: 144 }
    }
};

const urls = {
    default: '/img/avatar.webp',
    anonymous: '/img/anonymous.webp'
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type AvatarProps = Readonly<{
    alt?: string;
    className?: string;
    disableScale?: boolean;
    size?: keyof typeof config.wrapperSize;
    src: string | 'default' | 'anonymous';
}>;

export const Avatar: React.FC<AvatarProps> = ({
    alt,
    className,
    disableScale = false,
    size = 'md',
    src
}) => {
    const url = src === 'default' || src === 'anonymous' ? urls[src] : src;
    const imgClassName =
        ['default', 'anonymous'].includes(src) && !disableScale
            ? 'scale-125'
            : '';

    return (
        <div
            className={`rounded-full overflow-hidden ${config.wrapperSize[size].classes} ${className || ''}`}
        >
            <Image
                src={url}
                alt={alt || 'avatar'}
                width={config.wrapperSize[size].size}
                height={config.wrapperSize[size].size}
                className={imgClassName}
                priority={false}
            />
        </div>
    );
};
