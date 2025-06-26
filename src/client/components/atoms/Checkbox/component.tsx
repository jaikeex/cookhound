import React from 'react';
import { classNames } from '@/client/utils';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    color: {
        primary: `checked:bg-blue-400 checked:border-blue-400
        checked:dark:bg-blue-600 checked:dark:border-blue-600`,
        secondary: `checked:bg-green-400 checked:border-green-400
        checked:dark:bg-green-600 checked:dark:border-green-600`
    },
    size: {
        input: {
            sm: `w-4 h-4`,
            md: `w-5 h-5`,
            lg: `w-6 h-6`
        },
        svg: {
            sm: `w-3 h-3`,
            md: `w-4 h-4`,
            lg: `w-5 h-5`
        }
    }
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type CheckboxProps = Readonly<{
    className?: string;
    color?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
}> &
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

export const Checkbox: React.FC<CheckboxProps> = ({
    className,
    color = 'primary',
    size = 'md',
    ...props
}) => {
    return (
        <div className={`relative flex gap-2 ${className}`}>
            <input
                {...props}
                type="checkbox"
                className={classNames(
                    `peer checkbox`,
                    classConfig.color[color],
                    classConfig.size.input[size]
                )}
            />

            <svg
                className={classNames(
                    `absolute mt-0.5 ml-0.5 opacity-0 peer-checked:opacity-100 transition-opacity`,
                    `duration-150 ease-in-out pointer-events-none`,
                    classConfig.size.svg[size]
                )}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <polyline points="20 6 9 17 4 12" />
            </svg>
        </div>
    );
};
