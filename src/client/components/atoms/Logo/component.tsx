import React from 'react';
import Image from 'next/image';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    xs: {
        img: 32,
        widthClassName: 'w-8',
        heightClassName: 'h-8',
        text: 'text-xl translate-y-0.5',
        wrapper: 'gap-1'
    },
    sm: {
        img: 48,
        widthClassName: 'w-12',
        heightClassName: 'h-12',
        text: 'text-2xl translate-y-0.5',
        wrapper: 'gap-1.5'
    },
    md: {
        img: 64,
        widthClassName: 'w-16',
        heightClassName: 'h-16',
        text: 'text-3xl translate-y-1',
        wrapper: 'gap-2'
    },
    lg: {
        img: 96,
        widthClassName: 'w-24',
        heightClassName: 'h-24',
        text: 'text-4xl translate-y-3',
        wrapper: 'gap-2.5'
    },
    xl: {
        img: 128,
        widthClassName: 'w-32',
        heightClassName: 'h-32',
        text: 'text-5xl translate-y-4',
        wrapper: 'gap-3'
    }
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type LogoProps = Readonly<{
    className?: string;
    priority?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    withText?: boolean;
}>;

export const Logo: React.FC<LogoProps> = ({
    className,
    priority = false,
    size = 'md',
    withText = true
}) => {
    return (
        <div
            className={`flex items-center py-1 px-0.5 ${classConfig[size].wrapper} ${className}`}
        >
            <div
                className={`relative ${classConfig[size].widthClassName} ${classConfig[size].heightClassName}`}
            >
                <Image
                    src={'/img/logo-light.png'}
                    className="absolute inset-0 dark:opacity-0"
                    alt="logo"
                    width={classConfig[size].img}
                    height={classConfig[size].img}
                    priority={priority}
                />
                <Image
                    src={'/img/logo-dark.png'}
                    className="absolute inset-0 opacity-0 dark:opacity-100"
                    alt="logo"
                    width={classConfig[size].img}
                    height={classConfig[size].img}
                    priority={priority}
                />
            </div>
            {withText ? (
                <span className={`font-kalam ${classConfig[size].text}`}>
                    Cookhound
                </span>
            ) : null}
        </div>
    );
};
