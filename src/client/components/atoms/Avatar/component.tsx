import React from 'react';
import Image from 'next/image';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const config = {
    wrapperSize: {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
        xl: 'h-16 w-16',
        xxl: 'h-24 w-24'
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
    src: string | 'default' | 'anonymous';
    size?: keyof typeof config.wrapperSize;
}>;

export const Avatar: React.FC<AvatarProps> = ({
    alt,
    className,
    src,
    size = 'md'
}) => {
    const url = src === 'default' || src === 'anonymous' ? urls[src] : src;
    const imgClassName = ['default', 'anonymous'].includes(src)
        ? 'scale-125'
        : '';

    return (
        <div
            className={`rounded-full overflow-hidden ${config.wrapperSize[size]} ${className}`}
        >
            <Image
                src={url}
                alt={alt || 'avatar'}
                width={96}
                height={96}
                className={imgClassName}
            />
        </div>
    );
};
