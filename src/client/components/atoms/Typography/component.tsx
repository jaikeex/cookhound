import React from 'react';
import { classNames } from '@/client/utils';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    variant: {
        'heading-xl': 'text-3xl font-semibold',
        'heading-lg': 'text-2xl font-semibold',
        'heading-md': 'text-xl font-bold',
        'heading-sm': 'text-lg font-bold',
        'heading-xs': 'text-base font-bold',
        'body': 'text-base',
        'body-md': 'text-md',
        'body-sm': 'text-sm',
        'body-xs': 'text-xs',
        'label': 'text-sm font-semibold',
        'error': 'font-semibold text-red-700 dark:text-red-500'
    },

    align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
        justify: 'text-justify'
    }
};

export type TypographyVariant =
    | 'heading-xl'
    | 'heading-lg'
    | 'heading-md'
    | 'heading-sm'
    | 'heading-xs'
    | 'body'
    | 'body-md'
    | 'body-sm'
    | 'body-xs'
    | 'label'
    | 'error';

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type TypographyOwnProps<E extends React.ElementType> = Readonly<{
    align?: 'left' | 'center' | 'right' | 'justify';
    as?: E;
    disableLinkStyles?: boolean;
    variant?: TypographyVariant;
}>;

export type TypographyProps<E extends React.ElementType> =
    TypographyOwnProps<E> &
        Omit<React.ComponentProps<E>, keyof TypographyOwnProps<E>>;

export const Typography = <E extends React.ElementType = 'p'>({
    align,
    as,
    children,
    className = '',
    disableLinkStyles = false,
    variant = 'body',
    ...props
}: TypographyProps<E>) => {
    const Component = as || 'p';

    return (
        <Component
            {...props}
            className={classNames(
                `font-open-sans md:antialiased ${classConfig.variant[variant]} ${disableLinkStyles ? 'no-underline typography-base' : ''}`,
                align && classConfig.align[align],
                className
            )}
        >
            {children}
        </Component>
    );
};
