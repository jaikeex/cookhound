'use client';

import { Typography } from '@/client/components';
import { classNames } from '@/client/utils';
import React from 'react';

const classConfig = {
    colors: {
        1: {
            bgColor: 'bg-green-300 dark:bg-green-800 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-primary-400'
        },
        2: {
            bgColor: 'bg-lime-400 dark:bg-lime-800 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-secondary-400'
        },
        3: {
            bgColor: 'bg-blue-200 dark:bg-blue-800 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-warning-400'
        },
        4: {
            bgColor: 'bg-slate-300 dark:bg-slate-600 shadow-md',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-danger-400'
        },
        5: {
            bgColor: 'bg-emerald-300 dark:bg-emerald-800',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-gray-200 dark:border-gray-700'
        },
        6: {
            bgColor: 'bg-fuchsia-300 dark:bg-fuchsia-800',
            color: 'text-black dark:text-gray-200',
            outline: 'border border-gray-200 dark:border-gray-700'
        }
    },
    sizes: {
        xs: {
            dimensions: 'py-0.5 px-2',
            text: 'text-xs',
            icon: 12,
            iconMargin: 'ml-1'
        },
        sm: {
            dimensions: 'py-0.5 px-2',
            text: 'text-sm',
            icon: 14,
            iconMargin: 'ml-1'
        },
        md: {
            dimensions: 'py-1.5 px-3',
            text: 'text-sm',
            icon: 16,
            iconMargin: 'ml-1'
        },
        lg: {
            dimensions: 'py-2 px-4',
            text: 'text-sm',
            icon: 20,
            iconMargin: 'ml-1'
        }
    }
};

type TagProps = Readonly<{
    name: string;
    categoryId: 1 | 2 | 3 | 4 | 5 | 6;
    className?: string;
    outlined?: boolean;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}>;

export const Tag: React.FC<TagProps> = ({
    name,
    categoryId,
    outlined = false,
    className,
    size = 'md'
}) => {
    return (
        <div
            className={classNames(
                'inline-flex items-center justify-center rounded-sm',
                classConfig.colors[categoryId].bgColor,
                classConfig.colors[categoryId].color,
                outlined && classConfig.colors[categoryId].outline,
                classConfig.sizes[size].dimensions,
                className
            )}
        >
            <Typography
                as="span"
                variant="label"
                className={classNames(classConfig.sizes[size].text)}
            >
                {name}
            </Typography>
        </div>
    );
};
