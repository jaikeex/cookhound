import React from 'react';
import Image from 'next/image';

// ------------------------------- class config -------------------------------
//                                    region

const classConfig = {
    xs: {
        img: 32,
        text: 'text-xl translate-y-0.5',
        wrapper: 'gap-1'
    },
    sm: {
        img: 48,
        text: 'text-2xl translate-y-0.5',
        wrapper: 'gap-1.5'
    },
    md: {
        img: 64,
        text: 'text-3xl translate-y-1',
        wrapper: 'gap-2'
    },
    lg: {
        img: 96,
        text: 'text-4xl translate-y-3',
        wrapper: 'gap-2.5'
    },
    xl: {
        img: 128,
        text: 'text-5xl translate-y-4',
        wrapper: 'gap-3'
    }
};

//                                  endregion
// ----------------------------------------------------------------------------

type LogoProps = Readonly<{
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    withText?: boolean;
}>;

export const Logo: React.FC<LogoProps> = ({
    className,
    size = 'md',
    withText = true
}) => {
    return (
        <div
            className={`flex items-center py-1 px-0.5 ${classConfig[size].wrapper} ${className}`}
        >
            <Image
                src={'/img/logo-light.png'}
                className="dark:hidden"
                alt="logo"
                width={classConfig[size].img}
                height={classConfig[size].img}
            />
            <Image
                src={'/img/logo-dark.png'}
                className="hidden dark:block"
                alt="logo"
                width={classConfig[size].img}
                height={classConfig[size].img}
            />
            {withText ? (
                <span className={`font-kalam ${classConfig[size].text}`}>
                    Cookhound
                </span>
            ) : null}
        </div>
    );
};
