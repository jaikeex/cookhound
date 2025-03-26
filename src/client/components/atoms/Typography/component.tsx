import React from 'react';
import classnames from 'classnames';

// ------------------------------- class config -------------------------------
//                                    region

const classConfig = {
    variant: {
        'heading-xl': 'text-3xl font-semibold',
        'heading-lg': 'text-2xl font-semibold',
        'heading-md': 'text-xl font-bold',
        'heading-sm': 'text-lg font-bold',
        'heading-xs': 'text-base font-bold',
        'body': 'text-base',
        'body-sm': 'text-sm',
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

//                                  endregion
// ----------------------------------------------------------------------------

export type TypographyVariant =
    | 'heading-xl'
    | 'heading-lg'
    | 'heading-md'
    | 'heading-sm'
    | 'heading-xs'
    | 'body'
    | 'body-sm'
    | 'label'
    | 'error';

type TypographyOwnProps<E extends React.ElementType> = Readonly<{
    align?: 'left' | 'center' | 'right' | 'justify';
    as?: E;
    variant?: TypographyVariant;
}>;

export type TypographyProps<E extends React.ElementType> =
    TypographyOwnProps<E> &
        Omit<React.ComponentProps<E>, keyof TypographyOwnProps<E>>;

export const Typography = <E extends React.ElementType = 'p'>({
    align,
    className = '',
    variant = 'body',
    children,
    as,
    ...props
}: TypographyProps<E>) => {
    const Component = as || 'p';

    return (
        <Component
            {...props}
            className={classnames(
                `font-open-sans ${classConfig.variant[variant]}`,
                align && classConfig.align[align],
                className
            )}
        >
            {children}
        </Component>
    );
};
